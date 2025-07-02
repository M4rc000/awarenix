import { useState, useEffect } from "react";
import Swal from "../utils/AlertContainer";
import { useRef } from "react";
import Checkbox from "../form/input/Checkbox";

const TEMPLATE_WELCOME = `<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                    Welcome to Our Platform!
                                </h1>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                                    Hello There! 👋
                                </h2>
                                
                                <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                                    Thank you for joining our community. We're excited to have you on board and can't wait for you to explore all the amazing features we have prepared for you.
                                </p>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 25px 0;">
                                    <tr>
                                        <td style="padding: 20px;">
                                            <h3 style="color: #333333; margin: 0 0 10px 0; font-size: 18px;">
                                                🚀 What's Next?
                                            </h3>
                                            <ul style="color: #666666; margin: 0; padding-left: 20px; line-height: 1.8;">
                                                <li>Complete your profile setup</li>
                                                <li>Explore our dashboard</li>
                                                <li>Connect with other users</li>
                                                <li>Start your first project</li>
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                    <tr>
                                        <td align="center">
                                            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 3px 6px rgba(0,0,0,0.1);">
                                                Get Started Now
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                                    If you have any questions, our support team is here to help. Just reply to this email or visit our help center.
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.4;">
                                    © 2025 Your Company Name. All rights reserved.<br>
                                    123 Business Street, City, State 12345<br>
                                    <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> | 
                                    <a href="#" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>`;

const TEMPLATE_LOGIN_VERIFICATION = `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification - YourAppName</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; color: #1a73e8; }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #1a73e8;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 4px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 30px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="padding: 25px 0;">
                            <img src="https://via.placeholder.com/150x50/1a73e8/ffffff?text=YourAppLogo" alt="Your App Logo" style="display: block; border: 0; height: 50px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: left;">
                            <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">Verify Your Login</h1>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                We noticed a login attempt from a new device or location. To ensure your account security, please verify this activity.
                            </p>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                <strong>Device:</strong> Windows PC<br>
                                <strong>Browser:</strong> Chrome<br>
                                <strong>Location:</strong> Jakarta, Indonesia (approx.)<br>
                                <strong>Time:</strong> June 20, 2025, 4:15 PM WIB
                            </p>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 25px 0;">
                                If this was you, please click the button below to confirm.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="https://your-app.com/verify-login?token=YOUR_VERIFICATION_TOKEN" class="button">
                                            Verify My Login
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #777777; line-height: 1.6; font-size: 13px; margin: 0;">
                                If you did not attempt to log in, please secure your account immediately by changing your password.
                                <a href="https://your-app.com/reset-password" style="color: #1a73e8;">Reset Password</a>.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 25px 40px; border-top: 1px solid #eeeeee; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                &copy; 2025 YourAppName. All rights reserved.
                            </p>
                            <p style="color: #999999; font-size: 11px; margin: 10px 0 0 0;">
                                You received this email because you recently attempted to log into your account.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const TEMPLATE_PASSWORD_RESET = `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - YourAppName</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; color: #007bff; }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #007bff;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f7;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f7;">
        <tr>
            <td align="center" style="padding: 30px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <tr>
                        <td align="center" style="padding: 25px 0;">
                            <img src="https://via.placeholder.com/150x50/007bff/ffffff?text=YourAppLogo" alt="Your App Logo" style="display: block; border: 0; height: 50px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: left;">
                            <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">Password Reset Request</h1>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                We received a request to reset the password for your account.
                            </p>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 25px 0;">
                                To reset your password, please click the button below:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="https://your-app.com/reset-password?token=YOUR_RESET_TOKEN" class="button">
                                            Reset Your Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #777777; line-height: 1.6; font-size: 13px; margin: 0;">
                                This link will expire in 24 hours. If you did not request a password reset, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 25px 40px; border-top: 1px solid #eeeeee; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                &copy; 2025 YourAppName. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const TEMPLATE_ORDER_CONFIRMATION = `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - YourStore</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #f8f8f8; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; color: #28a745; }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #28a745;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 4px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f8f8;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f8f8;">
        <tr>
            <td align="center" style="padding: 30px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="padding: 25px 0;">
                            <h2 style="color: #28a745; font-size: 26px; margin: 0;">🎉 Order Confirmed!</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: left;">
                            <h1 style="color: #333333; font-size: 22px; margin: 0 0 15px 0;">Hi [Customer Name],</h1>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                Thank you for your order! Your order #<strong>123456789</strong> has been successfully placed and will be shipped soon.
                            </p>
                            <h3 style="color: #333333; font-size: 18px; margin: 25px 0 15px 0;">Order Summary:</h3>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 25px;">
                                <tr style="background-color: #f2f2f2;">
                                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Item</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Qty</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Price</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">Product A</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">1</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$29.99</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">Product B</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">2</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$15.00</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Total:</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold;">$59.99</td>
                                </tr>
                            </table>
                            <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 25px 0;">
                                You can view your order status and tracking information here:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <a href="https://your-app.com/order/123456789" class="button">
                                            View Your Order
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 25px 40px; border-top: 1px solid #eeeeee; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                &copy; 2025 YourStore. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const TEMPLATE_NEWSLETTER = `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Latest News from YourBlog</title>
    <style type="text/css">
        body { margin: 0; padding: 0; background-color: #eef2f5; font-family: Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table { border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        a { text-decoration: none; color: #3498db; }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #3498db;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 3px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #eef2f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #eef2f5;">
        <tr>
            <td align="center" style="padding: 25px 0;">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center">
                            <img src="https://via.placeholder.com/600x200/3498db/ffffff?text=YourBlog+Banner" alt="Newsletter Banner" style="display: block; width: 100%; max-width: 600px; border-radius: 8px 8px 0 0;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px 20px 40px; text-align: center;">
                            <h1 style="color: #333333; font-size: 28px; margin: 0 0 10px 0;">Your Latest News Update!</h1>
                            <p style="color: #666666; font-size: 14px; margin: 0;">Stay informed with our newest articles and insights.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <img src="https://via.placeholder.com/520x250/ccc/fff?text=Article+Image+1" alt="Article Image" style="display: block; width: 100%; max-width: 520px; border-radius: 4px; margin-bottom: 15px;">
                                        <h3 style="color: #333333; font-size: 20px; margin: 0 0 10px 0;">Exciting New Feature Released!</h3>
                                        <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                            Discover how our latest feature will revolutionize your workflow and boost productivity.
                                        </p>
                                        <a href="https://your-blog.com/article/new-feature" class="button">Read More</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 30px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        <img src="https://via.placeholder.com/520x250/ccc/fff?text=Article+Image+2" alt="Article Image" style="display: block; width: 100%; max-width: 520px; border-radius: 4px; margin-bottom: 15px;">
                                        <h3 style="color: #333333; font-size: 20px; margin: 0 0 10px 0;">Tips for Mastering [Topic]</h3>
                                        <p style="color: #555555; line-height: 1.6; font-size: 15px; margin: 0 0 15px 0;">
                                            Unlock the secrets to success with these actionable tips from industry experts.
                                        </p>
                                        <a href="https://your-blog.com/article/tips" class="button">Read More</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 20px 40px 30px 40px;">
                            <h3 style="color: #333333; font-size: 20px; margin: 0 0 15px 0;">Don't miss out on more updates!</h3>
                            <a href="https://your-blog.com/subscribe" class="button">Subscribe Now</a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 25px 40px; border-top: 1px solid #eeeeee; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                            <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                                &copy; 2025 YourBlog. All rights reserved.
                            </p>
                            <p style="color: #999999; font-size: 11px; margin: 0;">
                                <a href="https://your-blog.com/unsubscribe" style="color: #3498db;">Unsubscribe</a> | <a href="https://your-blog.com/privacy" style="color: #3498db;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;


const EMAIL_TEMPLATES = [
  { name: "Welcome Email", content: TEMPLATE_WELCOME },
  { name: "Login Verification (Social Media/Software Popular)", content: TEMPLATE_LOGIN_VERIFICATION },
  { name: "Password Reset Request", content: TEMPLATE_PASSWORD_RESET },
  { name: "Order Confirmation", content: TEMPLATE_ORDER_CONFIRMATION },
  { name: "Newsletter Update", content: TEMPLATE_NEWSLETTER },
];

type EmailBodyEditorTemplateProps = {
  templateName?: string;
  envelopeSender?: string;
  subject?: string;
  initialContent?: string;
  initialTrackerValue?: number;
  onBodyChange?: (body: string) => void;
  onTrackerChange?: (trackerValue: number) => void;
};

// MENGGANTI TAG A HREF TO {{ .URL }}
const replaceLinksWithUrlPlaceholder = (htmlString: string): string => {
  const linkRegex = /(<a\s+(?:[^>]*?\s+)?href=["']?)([^"'>]+)(["']?[^>]*>)/gi;
  return htmlString.replace(linkRegex, `$1{{.URL}}$3`);
};

const EmailBodyEditorTemplate = ({
  templateName,
  envelopeSender,
  subject,
  onBodyChange,
  initialContent = "",
  onTrackerChange,
  initialTrackerValue = 0,
}: EmailBodyEditorTemplateProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    // Inisialisasi awal htmlContent dengan memproses initialContent dari props
    let contentToUse = initialContent;
    if (initialContent === "") {
      contentToUse = TEMPLATE_WELCOME; // Default ke Welcome Template jika initialContent kosong
    }
    return replaceLinksWithUrlPlaceholder(contentToUse);
  });
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    // Menentukan selectedTemplate berdasarkan initialContent
    const matchedTemplate = EMAIL_TEMPLATES.find(template => template.content === initialContent);
    return matchedTemplate ? matchedTemplate.name : "Custom";
  });
  const [trackerImage, setTrackerImage] = useState(initialTrackerValue);

  // Effect untuk mengirim nilai tracker image ke parent component
  useEffect(() => {
    if (onTrackerChange) {
      onTrackerChange(trackerImage);
    }
  }, [trackerImage, onTrackerChange]);

  // Effect untuk melakukan sinkronisasi htmlContent internal dengan initialContent dari parent
  useEffect(() => {
    // Proses initialContent dari parent, pastikan link sudah diganti
    const processedInitialContent = replaceLinksWithUrlPlaceholder(initialContent === "" ? TEMPLATE_WELCOME : initialContent);

    // Hanya update state internal jika ada perbedaan setelah pemrosesan
    if (htmlContent !== processedInitialContent) {
      setHtmlContent(processedInitialContent);
      // Perbarui selectedTemplate juga saat initialContent berubah
      const matchedTemplate = EMAIL_TEMPLATES.find(template => template.content === initialContent);
      setSelectedTemplate(matchedTemplate ? matchedTemplate.name : "Custom");
    }
  }, [initialContent]); // Dependensi hanya pada initialContent

  // Effect untuk memanggil onBodyChange setiap kali htmlContent (state internal) berubah
  // Ini memastikan parent selalu mendapatkan versi terbaru dari body email yang sudah diproses link-nya
  useEffect(() => {
    if (onBodyChange) {
      onBodyChange(htmlContent);
    }
  }, [htmlContent, onBodyChange]); // Bergantung pada htmlContent dan onBodyChange

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateName = event.target.value;
    setSelectedTemplate(newTemplateName);

    if (newTemplateName === "Custom") {
      // Jika "Custom" dipilih, biarkan pengguna mengedit manual.
      // Anda bisa setHtmlContent('') jika ingin mengosongkan editor saat memilih "Custom".
      return;
    }

    const template = EMAIL_TEMPLATES.find(t => t.name === newTemplateName);
    if (template) {
      // Terapkan penggantian link saat memilih template bawaan
      const processedContent = replaceLinksWithUrlPlaceholder(template.content);
      setHtmlContent(processedContent);
    }
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click(); // Memicu klik pada input file yang tersembunyi
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validasi tipe file .eml
    if (file.type !== "message/rfc822" && !file.name.toLowerCase().endsWith(".eml")) {
      Swal.fire({
        text: "Please select a valid EML file (.eml).",
        icon: 'error',
        duration: 3000,
      });
      // Bersihkan input file agar pengguna bisa memilih ulang file yang sama jika salah
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const emlContent = e.target?.result as string;
      const extractedHtml = extractHtmlFromEml(emlContent); // Fungsi ini sudah memanggil replaceLinksWithUrlPlaceholder

      if (extractedHtml) {
        setHtmlContent(extractedHtml); // Langsung set, karena sudah diproses di extractHtmlFromEml
        setSelectedTemplate("Custom");
        Swal.fire({
          text: "EML file imported successfully!",
          icon: 'success',
          duration: 2000,
        });
      } else {
        Swal.fire({
          text: "Could not find HTML content in the EML file. Please ensure it contains an HTML part.",
          icon: 'warning',
          duration: 4000,
        });
      }
      // Bersihkan input file setelah pemrosesan
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      Swal.fire({
        text: "Failed to read EML file. Please try again.",
        icon: 'error',
        duration: 3000,
      });
      // Bersihkan input file setelah error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Fungsi sederhana untuk mengekstrak bagian HTML dari file EML
  // Catatan: Ini adalah implementasi dasar dan mungkin tidak mencakup semua struktur EML yang kompleks
  const extractHtmlFromEml = (emlString: string): string | null => {
    // Mencari bagian Content-Type: text/html
    const htmlPartRegex = /Content-Type: text\/html;(?:\s*charset=["']?utf-8["']?)?(?:;.*)?\s*\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/i;
    const match = emlString.match(htmlPartRegex);

    if (match && match[1]) {
      // Mengecek Content-Transfer-Encoding
      const encodingMatch = emlString.match(/Content-Transfer-Encoding: (\S+)/i);
      const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : '';

      let htmlContentPart = match[1].trim();

      // Decode berdasarkan encoding
      if (encoding === 'quoted-printable') {
        htmlContentPart = htmlContentPart.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      } else if (encoding === 'base64') {
        try {
          htmlContentPart = atob(htmlContentPart);
        } catch (e) {
          console.error("Base64 decoding failed:", e);
          return null;
        }
      }
      // Panggil fungsi untuk mengganti link setelah decoding
      return replaceLinksWithUrlPlaceholder(htmlContentPart);
    }

    // Fallback: Jika tidak ada header Content-Type: text/html yang spesifik, coba cari tag <html>
    const fallbackHtmlRegex = /(<html[\s\S]*<\/html>)/i;
    const fallbackMatch = emlString.match(fallbackHtmlRegex);
    if (fallbackMatch && fallbackMatch[1]) {
      // Panggil juga untuk fallback HTML
      return replaceLinksWithUrlPlaceholder(fallbackMatch[1]);
    }

    return null;
  };

  const tabs = ["HTML Editor", "Live Preview"];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Template Selector */}
        <div className="p-4">
          <label htmlFor="email-template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Email Template:
          </label>
          <div className="relative">
            {/* Custom Select Component (if you choose to make one) */}
            {/* If using your custom Select component, make sure it applies the styling */}
            <select
              id="email-template-select"
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="
                appearance-none
                block w-full px-4 py-3
                text-base
                border border-gray-300 dark:border-gray-700
                rounded-lg
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                shadow-sm
                transition-all duration-200 ease-in-out
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:focus:ring-blue-400 dark:focus:border-blue-400
                cursor-pointer
                pr-10
              "
            >
              <option value="Custom">Custom Template</option>
              {EMAIL_TEMPLATES.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Import Template Button and hidden file input */}
        <div className="p-4 mx-5 flex items-end"> {/* Align button to the bottom if content above is taller */}
          <button
            onClick={handleImportButtonClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 w-full md:w-auto rounded-lg text-sm font-medium transition-colors duration-200 shadow-md flex items-center justify-center gap-2 h-12"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M.07 7.07l2.94 2.94a1.5 1.5 0 002.12 0L8.07 7.07a1.5 1.5 0 000-2.12L5.95 2.83a.5.5 0 00-.7-.07l-4 3.75a.5.5 0 00-.07.7zM10 12a1 1 0 100 2h7a1 1 0 100-2h-7z" clipRule="evenodd" />
            </svg>
            <span>Import EML File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".eml,message/rfc822"
            className="hidden"
          />
        </div>

        <div className="p-4 flex items-center mt-6">
          <Checkbox
            id="tracker-image"
            label="Tracker Image?"
            onChange={(isChecked: boolean) => {
              setTrackerImage(isChecked ? 1 : 0);
            }}
            checked={trackerImage === 1}
          />
        </div>
      </div>


      {/* Tab Navigation */}
      <div className="flex space-x-1 mx-4 bg-gray-100 dark:bg-gray-800 p-1 mb-0 rounded-lg">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ease-in-out ${
              activeTab === index
                ? "bg-white text-blue-600 shadow-md dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl min-h-[500px]">
        {activeTab === 0 ? (
          // HTML Editor Tab
          <div className="p-4 h-full">
            <div className="mb-4">
              <label htmlFor="html-editor-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edit HTML Email Template:
              </label>
              <textarea
                id="html-editor-textarea"
                value={htmlContent}
                onChange={(e) => {
                  setHtmlContent(e.target.value);
                  setSelectedTemplate("Custom"); // Set to custom when user starts typing
                }}
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
                placeholder="Masukkan HTML content di sini..."
              />
            </div>

            {/* Quick Insert Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<p style="color: #666; margin: 10px 0;">New paragraph</p>')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                title="Insert a new paragraph tag"
              >
                + Paragraph
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<h2 style="color: #333; margin: 15px 0;">New Heading</h2>')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                title="Insert a new heading (H2) tag"
              >
                + Heading
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<a href="#" style="color: #667eea; text-decoration: none;">Link Text</a>')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                title="Insert a new anchor (link) tag"
              >
                + Link
              </button>
              <button
                onClick={() => setHtmlContent(prev => prev + '\n<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">Box Content</div>')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors duration-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                title="Insert a new content box div"
              >
                + Box
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner">
              <strong className="block mb-1 text-gray-700 dark:text-gray-300">💡 Important Tips for Email HTML:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li><strong>Security:</strong> Link and script tags are disabled in the preview for security reasons.</li>
                <li><strong>Layout:</strong> Always use a table-based layout for maximum email client compatibility.</li>
                <li><strong>Styling:</strong> Prefer inline CSS for styling elements, as external stylesheets might not be supported.</li>
                <li><strong>Testing:</strong> Crucially, test your email on various email clients (e.g., Gmail, Outlook, Apple Mail, etc.) and devices.</li>
                <li><strong>Responsiveness:</strong> Use media queries and fluid layouts for optimal mobile viewing.</li>
                <li><strong>Width:</strong> Use fixed widths in pixels for main content tables (e.g., `max-width: 600px`).</li>
              </ul>
            </div>
          </div>
        ) : (
          // Live Preview Tab
          <div className="p-4 h-full">
            {/* Email Header Info */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                <strong>📧 Email Preview Details:</strong>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <div><strong>From:</strong> <span className="text-gray-700 dark:text-gray-300">{templateName || "Welcome Email"}</span></div>
                <div><strong>From:</strong> <span className="text-gray-700 dark:text-gray-300">{envelopeSender || "your-team@company.com"}</span></div>
                <div><strong>Subject:</strong> <span className="text-gray-700 dark:text-gray-300">{subject || "Welcome to Our Platform!"}</span></div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[400px] overflow-hidden flex items-center justify-center relative">
              {htmlContent ? (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-full min-h-[400px] border-none"
                  title="Email Preview"
                  sandbox="allow-same-origin allow-popups"
                  style={{ background: '#ffffff' }}
                />
              ) : (
                <div className="p-8 text-gray-400 text-center">
                  <div className="text-6xl mb-4 animate-bounce">✉️</div>
                  <div className="text-lg font-medium">No HTML content to display.</div>
                  <div className="text-sm mt-2">Start typing in the HTML editor or choose a template!</div>
                </div>
              )}
            </div>

            {/* Preview Notes */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  <strong><span className="text-base">🖥️</span> Desktop View Insight</strong><br/>
                  This preview reflects how your email will likely appear in common desktop email clients (e.g., Outlook, Thunderbird, Mail for Mac).
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900">
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  <strong><span className="text-base">📱</span> Mobile Responsiveness Reminder</strong><br/>
                  For optimal mobile experience, ensure you incorporate responsive design techniques like media queries. This preview may not fully represent mobile rendering.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailBodyEditorTemplate;