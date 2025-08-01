import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { adminAuth } from '../middleware/auth';
import { AdminSampleAudioController } from '../controllers/AdminSampleAudioController';
import { AdminGalleryController } from '../controllers/AdminGalleryController';
import { AdminUserController } from '../controllers/AdminUserController';
import { AdminLabelController } from '../controllers/AdminLabelController';
import { AdminTagController } from '../controllers/AdminTagController';
import { AdminCategoryController } from '../controllers/AdminCategoryController';
import { AdminServiceController } from '../controllers/AdminServiceController';
import { AdminCouponController } from '../controllers/AdminCouponController';
import { AdminGiftController } from '../controllers/AdminGiftController';
import { AdminOrderController } from '../controllers/AdminOrderController';
import { AdminBlogController } from '../controllers/AdminBlogController';
import { RevisionController } from '../controllers/RevisionController';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure multer for blog image uploads
const blogImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'public/blog-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog_image_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const blogImageUpload = multer({
  storage: blogImageStorage,
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply admin authentication to all routes
router.use(adminAuth);

// Sample Audios
router.get('/sample-audios', AdminSampleAudioController.index);
router.post('/sample-audios', upload.fields([
  { name: 'before_audio', maxCount: 1 },
  { name: 'after_audio', maxCount: 1 }
]), AdminSampleAudioController.store);
router.get('/sample-audios/:id', AdminSampleAudioController.show);
router.post('/sample-audios/:id', upload.fields([
  { name: 'before_audio', maxCount: 1 },
  { name: 'after_audio', maxCount: 1 }
]), AdminSampleAudioController.update);
router.delete('/sample-audios/:id', AdminSampleAudioController.destroy);
router.put('/sample-audios/:id/status', AdminSampleAudioController.updateStatus);

// Gallery
router.get('/gallary', AdminGalleryController.index);
router.post('/gallary', upload.single('image'), AdminGalleryController.store);
router.get('/gallary/:id', AdminGalleryController.show);
router.put('/gallary/:id', AdminGalleryController.update);
router.delete('/gallary/:id', AdminGalleryController.destroy);

// Users
router.get('/users', AdminUserController.index);
router.post('/users', AdminUserController.store);
router.get('/users/:id', AdminUserController.show);
router.put('/users/:id', AdminUserController.update);
router.delete('/users/:id', AdminUserController.destroy);
router.put('/users/:id/status', AdminUserController.updateStatus);
router.post('/engineer/store', AdminUserController.storeEngineer);
router.get('/engineer/list', AdminUserController.listEngineer);
router.get('/engineer/:id', AdminUserController.showEngineer);

// Labels
router.get('/labels', AdminLabelController.index);
router.post('/labels', AdminLabelController.store);
router.get('/labels/:id', AdminLabelController.show);
router.put('/labels/:id', AdminLabelController.update);
router.delete('/labels/:id', AdminLabelController.destroy);

// Tags
router.get('/tags', AdminTagController.index);
router.post('/tags', AdminTagController.store);
router.get('/tags/:id', AdminTagController.show);
router.put('/tags/:id', AdminTagController.update);
router.delete('/tags/:id', AdminTagController.destroy);

// Categories
router.get('/categories', AdminCategoryController.index);
router.post('/categories', AdminCategoryController.store);
router.get('/categories/:id', AdminCategoryController.show);
router.put('/categories/:id', AdminCategoryController.update);
router.delete('/categories/:id', AdminCategoryController.destroy);
router.put('/categories/:id/status', AdminCategoryController.updateStatus);

// Services
router.get('/services', AdminServiceController.index);
router.post('/services', upload.single('image'), AdminServiceController.store);
router.get('/services/:id', AdminServiceController.show);
router.put('/services/:id', upload.single('image'), AdminServiceController.update);
router.delete('/services/:id', AdminServiceController.destroy);
router.post('/services/:id/status', AdminServiceController.updateStatus);
router.post('/services-update/:id', AdminServiceController.update);
router.get('/services-list', AdminServiceController.serviceList);

// Coupons
router.get('/coupons', AdminCouponController.index);
router.get('/coupons/:id', AdminCouponController.show);
router.post('/coupons', AdminCouponController.store);
router.put('/coupons/:id', AdminCouponController.update);
router.delete('/coupons/:id', AdminCouponController.destroy);
router.put('/coupon-update/:id', AdminCouponController.updateStatus);

// Gifts
router.get('/gifts', AdminGiftController.index);
router.post('/gifts', AdminGiftController.store);
router.get('/gifts/:id', AdminGiftController.show);
router.put('/gifts/:id', AdminGiftController.update);
router.delete('/gifts/:id', AdminGiftController.destroy);

// Orders
router.get('/order', AdminOrderController.index);
router.get('/order-details/:id', AdminOrderController.show);
router.put('/order/update-status/:id', AdminOrderController.updateStatus);
router.delete('/order/:id', AdminOrderController.destroy);
router.post('/order/upload-file/:id', AdminOrderController.orderUpdateFile);

// Blogs
router.get('/blogs', AdminBlogController.index);
router.get('/blogs/:id', AdminBlogController.show);
router.post('/blogs', blogImageUpload.single('image'), AdminBlogController.create);
router.put('/blogs/:id', blogImageUpload.single('image'), AdminBlogController.update);
router.put('/blogs/:id/status', AdminBlogController.updateStatus);
router.delete('/blogs/:id', AdminBlogController.destroy);

// Blog Categories
router.get('/blog-categories', AdminBlogController.getCategories);
router.post('/blog-categories', AdminBlogController.createCategory);
router.put('/blog-categories/:id', AdminBlogController.updateCategory);
router.delete('/blog-categories/:id', AdminBlogController.destroyCategory);

//Revision
router.post('/revisions/admin-flag/:id', adminAuth, RevisionController.flagAdmin);
router.post('/revisions/upload/:id', adminAuth, upload.none(), RevisionController.upload);



export default router; 