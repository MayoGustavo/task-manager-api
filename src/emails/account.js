const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (user) => {

    const msg = {
        to: user.email, 
        from: process.env.FROM_EMAIL, 
        subject: 'Welcome to Remember It!', 
        text: `Thanks for joining ${user.name}. I hope you like the app!`
    }

    sgMail.send(msg)
}

const sendFarewellEmail = (user) => {

    const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "We're sorry to see you go!",
        text: `We're sorry to see you go ${user.name}. Please let us know why the site didn't work for you. Thank you and we hope to see you back some day!`
    }

    sgMail.send(msg)
}


module.exports = {
    sendWelcomeEmail,
    sendFarewellEmail
}