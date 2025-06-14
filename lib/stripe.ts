import Stripe from 'stripe'

if(!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe_SECRET_KEY is not set")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
})
export default stripe