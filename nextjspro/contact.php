<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name    = htmlspecialchars($_POST['name'] ?? '');
    $email   = htmlspecialchars($_POST['email'] ?? '');
    $phone   = htmlspecialchars($_POST['phone'] ?? '');
    $subject = htmlspecialchars($_POST['subject'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');

    // Admin Email
    $adminEmail = "info@arxinfo.tech";

    // Logo URL (Must be public URL)
    $logoURL = "https://arxinfo.tech/assets/images/logo.png";

    // ============================
    // ADMIN EMAIL (Premium HTML)
    // ============================
    $adminSubject = "New Inquiry Received - ARX Infotech Website";

    $adminBody = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    </head>
    <body style='margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6;'>

        <div style='max-width:600px; margin:20px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0px 8px 25px rgba(0,0,0,0.12);'>

            <div style='background:#111827; padding:20px; text-align:center;'>
                <img src='$logoURL' alt='ARX Infotech Logo' style='max-width:160px; margin-bottom:10px;'>
                <h2 style='color:#facc15; margin:0;'>New Inquiry Received</h2>
                <p style='color:#ffffff; margin:5px 0 0; font-size:14px;'>ARX Infotech Website Contact Form</p>
            </div>

            <div style='padding:25px;'>
                <h3 style='color:#111827; margin-top:0;'>Inquiry Details</h3>

                <table style='width:100%; border-collapse:collapse; font-size:15px;'>
                    <tr>
                        <td style='padding:10px; background:#f9fafb; font-weight:bold;'>Name</td>
                        <td style='padding:10px;'>$name</td>
                    </tr>
                    <tr>
                        <td style='padding:10px; background:#f9fafb; font-weight:bold;'>Email</td>
                        <td style='padding:10px;'>$email</td>
                    </tr>
                    <tr>
                        <td style='padding:10px; background:#f9fafb; font-weight:bold;'>Phone</td>
                        <td style='padding:10px;'>$phone</td>
                    </tr>
                    <tr>
                        <td style='padding:10px; background:#f9fafb; font-weight:bold;'>Subject</td>
                        <td style='padding:10px;'>$subject</td>
                    </tr>
                </table>

                <div style='margin-top:20px; padding:15px; background:#f3f4f6; border-radius:10px;'>
                    <h4 style='margin:0 0 10px; color:#111827;'>Message</h4>
                    <p style='margin:0; color:#374151; line-height:1.6;'>$message</p>
                </div>

                <p style='margin-top:25px; font-size:13px; color:#6b7280;'>
                    This inquiry was submitted from ARX Infotech Contact Form.
                </p>
            </div>

            <div style='background:#111827; text-align:center; padding:12px;'>
                <p style='margin:0; font-size:13px; color:#9ca3af;'>
                    © " . date("Y") . " ARX Infotech. All Rights Reserved.
                </p>
            </div>

        </div>

    </body>
    </html>
    ";

    // Admin Headers
    $adminHeaders  = "MIME-Version: 1.0\r\n";
    $adminHeaders .= "Content-type:text/html;charset=UTF-8\r\n";
    $adminHeaders .= "From: ARX Infotech Website <info@arxinfo.tech>\r\n";
    $adminHeaders .= "Reply-To: $email\r\n";


    // ============================
    // USER CONFIRMATION EMAIL
    // ============================
    $userSubject = "Thank You for Contacting ARX Infotech";

    $userBody = "
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    </head>
    <body style='margin:0; padding:0; font-family: Arial, sans-serif; background:#f3f4f6;'>

        <div style='max-width:600px; margin:20px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0px 8px 25px rgba(0,0,0,0.12);'>

            <div style='background:#111827; padding:20px; text-align:center;'>
                <img src='$logoURL' alt='ARX Infotech Logo' style='max-width:160px; margin-bottom:10px;'>
                <h2 style='color:#facc15; margin:0;'>Thank You!</h2>
                <p style='color:#ffffff; margin:5px 0 0; font-size:14px;'>We received your inquiry successfully</p>
            </div>

            <div style='padding:25px;'>
                <h3 style='color:#111827; margin-top:0;'>Hello $name,</h3>

                <p style='color:#374151; font-size:15px; line-height:1.7;'>
                    Thank you for contacting <b>ARX Infotech</b>.  
                    We have received your message and our team will connect with you shortly.
                </p>

                <div style='margin-top:20px; padding:15px; background:#f9fafb; border-left:5px solid #facc15; border-radius:10px;'>
                    <h4 style='margin:0 0 10px; color:#111827;'>Your Message</h4>
                    <p style='margin:0; color:#374151; line-height:1.6;'>$message</p>
                </div>

                <p style='margin-top:20px; font-size:14px; color:#6b7280;'>
                    If you did not submit this request, please ignore this email.
                </p>

                <p style='margin-top:25px; color:#111827; font-weight:bold;'>
                    Regards,<br>
                    ARX Infotech Team
                </p>
            </div>

            <div style='background:#111827; text-align:center; padding:12px;'>
                <p style='margin:0; font-size:13px; color:#9ca3af;'>
                    © " . date("Y") . " ARX Infotech. All Rights Reserved.
                </p>
            </div>

        </div>

    </body>
    </html>
    ";

    // User Headers
    $userHeaders  = "MIME-Version: 1.0\r\n";
    $userHeaders .= "Content-type:text/html;charset=UTF-8\r\n";
    $userHeaders .= "From: ARX Infotech <info@arxinfo.tech>\r\n";
    $userHeaders .= "Reply-To: info@arxinfo.tech\r\n";


    // ============================
    // SEND BOTH EMAILS
    // ============================
    $adminMailSent = mail($adminEmail, $adminSubject, $adminBody, $adminHeaders);
    $userMailSent  = mail($email, $userSubject, $userBody, $userHeaders);

    if ($adminMailSent && $userMailSent) {
        echo "<script>
                alert('Thank you! Your message has been sent successfully.');
                window.location.href='contact.html';
              </script>";
    } else {
        echo "<script>
                alert('Oops! Message could not be sent. Please try again later.');
                window.location.href='contact.html';
              </script>";
    }

} else {
    header("Location: contact.html");
    exit();
}
?>