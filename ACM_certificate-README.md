# Hosting a Website on EC2 with HTTPS via ACM and Route 53

A complete step-by-step guide to hosting a website on AWS EC2 with a custom domain from Namecheap, using AWS Certificate Manager (ACM) for free SSL/TLS certificates and Route 53 for DNS management.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Step 1: Update Namecheap Nameservers](#step-1-update-namecheap-nameservers)
- [Step 2: Launch EC2 Instance and Install Web Server](#step-2-launch-ec2-instance-and-install-web-server)
- [Step 3: Create an Application Load Balancer](#step-3-create-an-application-load-balancer)
- [Step 4: Request ACM Certificate with DNS Validation](#step-4-request-acm-certificate-with-dns-validation)
- [Step 5: Add HTTPS Listener to ALB](#step-5-add-https-listener-to-alb)
- [Step 6: Point Route 53 to the ALB](#step-6-point-route-53-to-the-alb)
- [Step 7: Verify](#step-7-verify)
- [Important Notes](#important-notes)
- [Troubleshooting](#troubleshooting)
- [Summary Table](#summary-table)
- [License](#license)

---

## 🌐 Overview

This guide walks you through hosting a website on an AWS EC2 instance with a custom domain (`remoteops.online`) registered on Namecheap. Instead of using third-party SSL providers like Namecheap SSL or Let's Encrypt, you'll use **AWS Certificate Manager (ACM)** to issue and manage a free SSL/TLS certificate.

### 💡 The Key Insight
> **ACM cannot be directly attached to an EC2 instance.** ACM certificates can only be attached to AWS-managed services like Application Load Balancers (ALB), CloudFront, or API Gateway.
> 
> To use ACM with your EC2-hosted website, you must place an **Application Load Balancer (ALB)** in front of your EC2 instance.

---

## 🏗️ Architecture

```text
User (Browser)
      │
      ▼
┌─────────────────┐
│   Route 53      │  ◄── DNS resolution (remoteops.online)
│  (Hosted Zone)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      ALB        │  ◄── ACM Certificate attached here (HTTPS 443)
│ (Load Balancer) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   EC2 Instance  │  ◄── Web server (Nginx/Apache) on port 80
│   (Web Server)  │
└─────────────────┘
```

---

## 🔑 Prerequisites

Before starting, ensure you have:
* ✅ A domain registered on Namecheap (e.g., `remoteops.online`)
* ✅ An AWS account with access to EC2, Route 53, ACM, and IAM
* ✅ Basic familiarity with the AWS Management Console
* ✅ An SSH key pair for connecting to your EC2 instance
* ✅ A web server (Nginx or Apache) ready to install

---

## 🚀 Step-by-Step Guide

### Step 1: Update Namecheap Nameservers
First, delegate DNS control to Route 53 so AWS can manage your domain's DNS records.

1. Go to **AWS Route 53** → **Hosted zones** → **Create hosted zone**.
2. Enter `remoteops.online` and click **Create**.
3. Copy the four NS (nameserver) values displayed in the hosted zone.
4. In **Namecheap**, go to **Domain List** → **Manage** → **Nameservers**.
5. Select **Custom DNS** and paste the four Route 53 nameservers.
6. Save changes.

> ⏱️ **Note:** DNS propagation can take 5 minutes to 48 hours. In most cases, it completes within an hour.

**Verify propagation (optional):**
```bash
dig NS remoteops.online +short
```
*You should see the four Route 53 nameservers listed.*

---

### Step 2: Launch EC2 Instance and Install Web Server

1. Launch an EC2 instance (`t2.micro` is free tier eligible). Ensure **Auto-assign Public IP** is enabled.
2. Configure the **Security Group** to allow:
   * **HTTP (port 80)** from `0.0.0.0/0`
   * **SSH (port 22)** from your IP
3. SSH into the instance and install a web server.

**For Amazon Linux 2 / 2026:**
```bash
sudo yum update -y
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

**For Ubuntu:**
```bash
sudo apt update -y
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

4. Test by visiting the EC2 public IP in your browser. You should see the Nginx welcome page.

---

### Step 3: Create an Application Load Balancer

1. Go to **EC2** → **Load Balancers** → **Create Load Balancer** → **Application Load Balancer**.
2. Name it, set scheme to **Internet-facing**, and select at least two Availability Zones.
3. Create a **Target Group** (type: *Instances*, protocol: *HTTP*, port: *80*).
4. Register your EC2 instance as a target. The instance should show as healthy.
5. For the ALB's Listener, create an **HTTP listener on port 80** forwarding to your target group.
6. After creation, note the ALB DNS name.

> 💡 **Tip:** Make sure the ALB's security group allows inbound HTTP (80) and HTTPS (443) from `0.0.0.0/0`.

---

### Step 4: Request ACM Certificate with DNS Validation

1. Go to **AWS Certificate Manager (ACM)**.
   > ⚠️ **Important:** Request the certificate in the **same region** as your ALB.
2. Click **Request a certificate** → **Request a public certificate**.
3. Enter domain names:
   * `remoteops.online`
   * `www.remoteops.online` (add as Subject Alternative Name)
4. Select **DNS validation** (recommended).
5. After requesting, ACM will display the required CNAME records.
6. Click the **"Create records in Route 53"** button. ACM will automatically create the validation records.
7. Wait a few minutes. The certificate status will change from *Pending validation* to *Issued*.

> ⏱️ **Note:** DNS validation typically completes within 5–30 minutes.

---

### Step 5: Add HTTPS Listener to ALB

1. Go back to your **Load Balancer** → **Listeners** → **Add listener**.
2. Set protocol to **HTTPS** and port to **443**.
3. Under **Default SSL/TLS certificate**, select the ACM certificate you just issued.
4. Set the **Forward to** action to your existing target group.
5. Save. Your ALB now serves HTTPS.

> 💡 **Optional:** Add a redirect rule on the HTTP (80) listener to forward all traffic to HTTPS (443).

---

### Step 6: Point Route 53 to the ALB

1. In **Route 53** → **Hosted zones** → `remoteops.online`.
2. Create a new record:
   * **Name:** leave blank (for root domain) or `www`
   * **Type:** A – IPv4 address
   * **Alias:** Yes
   * **Route traffic to:** Alias to Application Load Balancer
   * Select your region and your ALB.
3. Repeat for `www` if desired.

---

### Step 7: Verify

1. Wait a few minutes, then visit `https://remoteops.online` in your browser.
2. You should see:
   * ✅ A padlock icon indicating the connection is secure
   * ✅ Your website content served correctly

**Verify with `curl`:**
```bash
curl -I https://remoteops.online
```
*You should see `HTTP/2 200` and headers indicating a secure connection.*

---

## 📌 Important Notes

### Why ALB is Required
You cannot attach an ACM certificate directly to an EC2 instance. ACM only works with:
* Application Load Balancer (ALB)
* Network Load Balancer (NLB)
* CloudFront
* API Gateway

### Region Matters
The ACM certificate must be in the **same AWS region** as your ALB. The only exception is CloudFront, which requires certificates in `us-east-1` (N. Virginia).

### Automatic Renewal
ACM automatically renews certificates that are:
1. DNS-validated, and
2. Actively in use

As long as the Route 53 validation records remain in place, your certificate will renew automatically without any manual intervention.

### 💰 Cost Considerations

| Service | Cost |
| :--- | :--- |
| **ACM Certificate** | Free |
| **Route 53 Hosted Zone** | ~$0.50 / month |
| **Application Load Balancer** | ~$0.0225 / hour + LCU charges |
| **EC2 Instance** | Depends on instance type (t2.micro free tier eligible) |

> ⚠️ **Note:** The ALB is the main cost driver here. If you want to avoid ALB costs, consider using **CloudFront** instead (which also supports ACM certificates), though it has its own cost model.

---

## 🛠️ Troubleshooting

### Certificate stuck in "Pending validation"
* Verify the CNAME records were created correctly in Route 53.
* Check DNS propagation using `dig`:
  ```bash
  dig CNAME _<validation-token>.remoteops.online +short
  ```
* Ensure the domain's nameservers point to Route 53.

### 502 Bad Gateway from ALB
* Check that your EC2 instance is healthy in the target group.
* Verify the web server is running:
  ```bash
  sudo systemctl status nginx
  ```
* Ensure the EC2 security group allows traffic from the ALB's security group on port 80.

### Website not loading after DNS change
* DNS propagation can take up to 48 hours. Be patient.
* Clear your browser cache or try an incognito window.
* Verify the A record in Route 53 points to the ALB (not the EC2 IP).

### HTTPS not working
* Ensure the HTTPS listener (port 443) is configured on the ALB.
* Verify the ACM certificate is in the **Issued** state.
* Check that the ALB's security group allows inbound HTTPS (443).

### "Not Secure" warning in browser
* The certificate may not cover the exact domain you're visiting.
* If you visit `www.remoteops.online`, ensure the certificate includes the `www` SAN.
* Ensure the Route 53 record for `www` points to the ALB.

---

## 📊 Summary Table

| Step | Action |
| :---: | :--- |
| **1** | Point Namecheap nameservers to Route 53 |
| **2** | Launch EC2 and install a web server |
| **3** | Create an ALB and target group |
| **4** | Request ACM certificate with DNS Validation |
| **5** | Add HTTPS listener to ALB |
| **6** | Point Route 53 A record to ALB |
| **7** | Verify HTTPS access |

---

## 📄 License

This guide is provided as-is for educational purposes. Feel free to adapt it for your own use.

**Author:** AWS Student Guide  
**Last Updated:** 2026
