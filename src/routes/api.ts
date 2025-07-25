import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/AuthController';
import { ServiceController } from '../controllers/ServiceController';
import { CategoryController } from '../controllers/CategoryController';
import { OrderController } from '../controllers/OrderController';
import { CartController } from '../controllers/CartController';
import { PaymentController } from '../controllers/PaymentController';
import { auth, optionalAuth } from '../middleware/auth';
import { SampleAudioController } from '../controllers/SampleAudioController';
import { GalleryController } from '../controllers/GalleryController';
import { FaqController } from '../controllers/FaqController';
import { TestimonialController } from '../controllers/TestimonialController';
import { UploadLeadController } from '../controllers/UploadLeadController';
import { ContactLeadController } from '../controllers/ContactLeadController';
import { ServiceTagController } from '../controllers/ServiceTagController';
import { GiftController } from '../controllers/GiftController';
import { LeadGenerationController } from '../controllers/LeadGenerationController';
import { ServicesPromoCodeController } from '../controllers/ServicesPromoCodeController';
import { PayPalController } from '../controllers/PayPalController';
import { ExcelController } from '../controllers/ExcelController';
import blogRoutes from './blog';
import { RevisionController } from '../controllers/RevisionController';

const router = Router();

// AUTH ROUTES
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/admin/login', AuthController.adminLogin);
router.get('/auth/verify-email/:userId/:token', AuthController.verifyEmail);
router.post('/auth/resend-verification', AuthController.resendVerificationEmail);
router.post('/auth/forgot-password', AuthController.forgotPassword);
router.post('/auth/reset-password', AuthController.resetPassword);
router.get('/auth/me', auth, AuthController.getCurrentUser);

// Favourite routes
router.get('/my-favourites', auth, AuthController.getFavourites);
router.post('/my-favourites', auth, AuthController.addFavourite);
router.delete('/my-favourites/:service_id', auth, AuthController.removeFavourite);
router.get('/my-favourites/:service_id/check', auth, AuthController.checkFavourite);
router.get('/my-favourites/count', auth, AuthController.getFavouriteCount);

// PUBLIC ROUTES
router.get('/sample-audios', SampleAudioController.index);
router.get('/sample-audios/:id', SampleAudioController.show);
router.get('/gallary', GalleryController.index);
router.get('/gallary/:id', GalleryController.show);
router.get('/categories', CategoryController.index);
// router.get('/categories/:id', CategoryController.show);
router.get('/categories/with-count', CategoryController.getWithServices);
router.get('/tags', ServiceTagController.index);
router.get('/services', ServiceController.index);
router.get('/services/:tag', ServiceController.show);
router.get('/services/search', ServiceController.search);
router.get('/services/category/:categoryId', ServiceController.getByCategory);
router.get('/service-details/:id', ServiceController.getServiceDetails);
router.get('/services-list', ServiceController.index);
router.get('/my-gifts', GiftController.index);
router.get('/my-gifts/:id', GiftController.show);
router.get('/lead/generation', LeadGenerationController.index);
router.get('/lead/generation/:id', LeadGenerationController.show);
router.post('/lead/generation', LeadGenerationController.store);
router.delete('/lead/generation/:id', LeadGenerationController.destroy);
router.get('/upload/lead/gen', UploadLeadController.index);
router.get('/upload/lead/gen/:id', UploadLeadController.show);

const upload = multer();

router.post('/upload/lead/gen', upload.none(), UploadLeadController.store);
router.delete('/upload/lead/gen/:id', UploadLeadController.destroy);
router.get('/download/zip/lead/:id', UploadLeadController.downloadZip);
router.post('/download-audio/:id', UploadLeadController.downloadAudio);
router.get('/export/lead', LeadGenerationController.exportLead);
router.get('/contact/lead/generation', ContactLeadController.index);
router.get('/contact/lead/generation/:id', ContactLeadController.show);
router.post('/contact/lead/generation', ContactLeadController.store);
router.delete('/contact/lead/generation/:id', ContactLeadController.destroy);
router.get('/promo-codes', ServicesPromoCodeController.index);
router.get('/promo-codes/:id', ServicesPromoCodeController.show);
router.put('/promo-codes/:id', ServicesPromoCodeController.update);
router.delete('/promo-codes/:id', ServicesPromoCodeController.destroy);
router.post('/insert-service-promo-codes', ServicesPromoCodeController.insertServicePromoCodes);
router.get('/my-promo-codes/verify/:code', ServicesPromoCodeController.verifyPromoCodes);
router.get('/faq-list', FaqController.FaqList);
router.get('/testimonial-list', TestimonialController.TestimonialList);
router.post('/buy-revision', PayPalController.revisionSuccess);
router.post('/order/update-status/:id', OrderController.updateStatus);
router.get('/generate-pdf', ExcelController.exportOrders);

// AUTHENTICATED ROUTES (to be wrapped with auth middleware)
router.get('/orders', optionalAuth, OrderController.index);
router.get('/orders/:id', optionalAuth, OrderController.show);
router.post('/orders', optionalAuth, OrderController.create);
router.put('/orders/:id/status', optionalAuth, OrderController.updateStatus);

// Cart routes (protected)
router.get('/cart', auth, CartController.index);
router.post('/cart', auth, CartController.add);
router.put('/cart/:serviceId', auth, CartController.update);
router.delete('/cart/:serviceId', auth, CartController.remove);

// Payment routes (protected)
router.post('/stripe/pay', auth, PaymentController.stripePay);
router.post('/stripe/pay/guest', optionalAuth, PaymentController.stripePay); // Guest checkout - no auth required
router.post('/stripe/intent', auth, PaymentController.createPaymentIntent);
router.post('/stripe/intent/guest',optionalAuth, PaymentController.createPaymentIntent); // Guest checkout - no auth required
router.post('/stripe/subscribe', auth, PaymentController.stripeSubscribe);
router.post('/stripe/subscribe/guest',optionalAuth, PaymentController.stripeSubscribe); // Guest subscription - no auth required
router.post('/paypal', optionalAuth, PaymentController.paypal); // Works for both auth and guest users
router.post('/create-subscription', auth, PaymentController.createSubscription);
router.get('/fetch/order', auth, PaymentController.getOrderDetails);
router.get('/user-orders/:user_id', PaymentController.userOrders);
router.post('/success', optionalAuth, PaymentController.success); // Works for both auth and guest users
router.get('/cancel', optionalAuth, PaymentController.cancel); // Works for both auth and guest users

// Stripe webhook endpoint (no auth required)
router.post('/stripe/webhook', PaymentController.stripeWebhook);

// Debug route for listing Stripe prices (for debugging purposes)

// New payment processing route with the specified structure

// REVISION ROUTES
router.post('/revision', auth, RevisionController.store);
router.post('/revisions/user-flag/:id', auth, RevisionController.flagUser);
router.get('/revisions/data', auth, RevisionController.getData);

// BLOG ROUTES
router.use('/', blogRoutes);

// ADMIN ROUTES
import adminRouter from './admin';
router.use('/admin', adminRouter);

export default router; 