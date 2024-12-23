<!DOCTYPE html>
<html>
<head>
    <title>Verify Change Your Phone Number</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            padding: 10px 0;
        }
        .content {
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #888888;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Verify Change Your Phone Number</h1>
    </div>
    <div class="content">
        <p>You send request want to change your phone  number. Please click this button if it's you send request</p>
        <a href="{{$verificationLink}}" class="button">Change Phone Number</a>
    </div>
    <div class="footer">
        <p>If you did not create an account, no further action is required.</p>
    </div>
</div>
</body>
</html>
