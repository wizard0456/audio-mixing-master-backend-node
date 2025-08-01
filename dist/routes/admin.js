"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const AdminSampleAudioController_1 = require("../controllers/AdminSampleAudioController");
const AdminGalleryController_1 = require("../controllers/AdminGalleryController");
const AdminUserController_1 = require("../controllers/AdminUserController");
const AdminLabelController_1 = require("../controllers/AdminLabelController");
const AdminTagController_1 = require("../controllers/AdminTagController");
const AdminCategoryController_1 = require("../controllers/AdminCategoryController");
const AdminServiceController_1 = require("../controllers/AdminServiceController");
const AdminCouponController_1 = require("../controllers/AdminCouponController");
const AdminGiftController_1 = require("../controllers/AdminGiftController");
const AdminOrderController_1 = require("../controllers/AdminOrderController");
const AdminBlogController_1 = require("../controllers/AdminBlogController");
const RevisionController_1 = require("../controllers/RevisionController");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
const blogImageStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDir = 'public/blog-images';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog_image_' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const blogImageUpload = (0, multer_1.default)({
    storage: blogImageStorage,
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
router.use(auth_1.adminAuth);
router.get('/sample-audios', AdminSampleAudioController_1.AdminSampleAudioController.index);
router.post('/sample-audios', upload.fields([
    { name: 'before_audio', maxCount: 1 },
    { name: 'after_audio', maxCount: 1 }
]), AdminSampleAudioController_1.AdminSampleAudioController.store);
router.get('/sample-audios/:id', AdminSampleAudioController_1.AdminSampleAudioController.show);
router.post('/sample-audios/:id', upload.fields([
    { name: 'before_audio', maxCount: 1 },
    { name: 'after_audio', maxCount: 1 }
]), AdminSampleAudioController_1.AdminSampleAudioController.update);
router.delete('/sample-audios/:id', AdminSampleAudioController_1.AdminSampleAudioController.destroy);
router.put('/sample-audios/:id/status', AdminSampleAudioController_1.AdminSampleAudioController.updateStatus);
router.get('/gallary', AdminGalleryController_1.AdminGalleryController.index);
router.post('/gallary', upload.single('image'), AdminGalleryController_1.AdminGalleryController.store);
router.get('/gallary/:id', AdminGalleryController_1.AdminGalleryController.show);
router.put('/gallary/:id', AdminGalleryController_1.AdminGalleryController.update);
router.delete('/gallary/:id', AdminGalleryController_1.AdminGalleryController.destroy);
router.get('/users', AdminUserController_1.AdminUserController.index);
router.post('/users', AdminUserController_1.AdminUserController.store);
router.get('/users/:id', AdminUserController_1.AdminUserController.show);
router.put('/users/:id', AdminUserController_1.AdminUserController.update);
router.delete('/users/:id', AdminUserController_1.AdminUserController.destroy);
router.put('/users/:id/status', AdminUserController_1.AdminUserController.updateStatus);
router.post('/engineer/store', AdminUserController_1.AdminUserController.storeEngineer);
router.get('/engineer/list', AdminUserController_1.AdminUserController.listEngineer);
router.get('/engineer/:id', AdminUserController_1.AdminUserController.showEngineer);
router.get('/labels', AdminLabelController_1.AdminLabelController.index);
router.post('/labels', AdminLabelController_1.AdminLabelController.store);
router.get('/labels/:id', AdminLabelController_1.AdminLabelController.show);
router.put('/labels/:id', AdminLabelController_1.AdminLabelController.update);
router.delete('/labels/:id', AdminLabelController_1.AdminLabelController.destroy);
router.get('/tags', AdminTagController_1.AdminTagController.index);
router.post('/tags', AdminTagController_1.AdminTagController.store);
router.get('/tags/:id', AdminTagController_1.AdminTagController.show);
router.put('/tags/:id', AdminTagController_1.AdminTagController.update);
router.delete('/tags/:id', AdminTagController_1.AdminTagController.destroy);
router.get('/categories', AdminCategoryController_1.AdminCategoryController.index);
router.post('/categories', AdminCategoryController_1.AdminCategoryController.store);
router.get('/categories/:id', AdminCategoryController_1.AdminCategoryController.show);
router.put('/categories/:id', AdminCategoryController_1.AdminCategoryController.update);
router.delete('/categories/:id', AdminCategoryController_1.AdminCategoryController.destroy);
router.put('/categories/:id/status', AdminCategoryController_1.AdminCategoryController.updateStatus);
router.get('/services', AdminServiceController_1.AdminServiceController.index);
router.post('/services', upload.single('image'), AdminServiceController_1.AdminServiceController.store);
router.get('/services/:id', AdminServiceController_1.AdminServiceController.show);
router.put('/services/:id', upload.single('image'), AdminServiceController_1.AdminServiceController.update);
router.delete('/services/:id', AdminServiceController_1.AdminServiceController.destroy);
router.post('/services/:id/status', AdminServiceController_1.AdminServiceController.updateStatus);
router.post('/services-update/:id', AdminServiceController_1.AdminServiceController.update);
router.get('/services-list', AdminServiceController_1.AdminServiceController.serviceList);
router.get('/coupons', AdminCouponController_1.AdminCouponController.index);
router.get('/coupons/:id', AdminCouponController_1.AdminCouponController.show);
router.post('/coupons', AdminCouponController_1.AdminCouponController.store);
router.put('/coupons/:id', AdminCouponController_1.AdminCouponController.update);
router.delete('/coupons/:id', AdminCouponController_1.AdminCouponController.destroy);
router.put('/coupon-update/:id', AdminCouponController_1.AdminCouponController.updateStatus);
router.get('/gifts', AdminGiftController_1.AdminGiftController.index);
router.post('/gifts', AdminGiftController_1.AdminGiftController.store);
router.get('/gifts/:id', AdminGiftController_1.AdminGiftController.show);
router.put('/gifts/:id', AdminGiftController_1.AdminGiftController.update);
router.delete('/gifts/:id', AdminGiftController_1.AdminGiftController.destroy);
router.get('/order', AdminOrderController_1.AdminOrderController.index);
router.get('/order-details/:id', AdminOrderController_1.AdminOrderController.show);
router.put('/order/update-status/:id', AdminOrderController_1.AdminOrderController.updateStatus);
router.delete('/order/:id', AdminOrderController_1.AdminOrderController.destroy);
router.post('/order/upload-file/:id', AdminOrderController_1.AdminOrderController.orderUpdateFile);
router.get('/blogs', AdminBlogController_1.AdminBlogController.index);
router.get('/blogs/:id', AdminBlogController_1.AdminBlogController.show);
router.post('/blogs', blogImageUpload.single('image'), AdminBlogController_1.AdminBlogController.create);
router.put('/blogs/:id', blogImageUpload.single('image'), AdminBlogController_1.AdminBlogController.update);
router.put('/blogs/:id/status', AdminBlogController_1.AdminBlogController.updateStatus);
router.delete('/blogs/:id', AdminBlogController_1.AdminBlogController.destroy);
router.get('/blog-categories', AdminBlogController_1.AdminBlogController.getCategories);
router.post('/blog-categories', AdminBlogController_1.AdminBlogController.createCategory);
router.put('/blog-categories/:id', AdminBlogController_1.AdminBlogController.updateCategory);
router.delete('/blog-categories/:id', AdminBlogController_1.AdminBlogController.destroyCategory);
router.post('/revisions/admin-flag/:id', auth_1.adminAuth, RevisionController_1.RevisionController.flagAdmin);
router.post('/revisions/upload/:id', auth_1.adminAuth, upload.none(), RevisionController_1.RevisionController.upload);
exports.default = router;
//# sourceMappingURL=admin.js.map