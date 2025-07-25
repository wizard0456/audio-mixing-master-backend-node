import { Response } from 'express';
import { Revision, Order, User, OrderItem } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendRevisionSuccessEmail } from '../services/EmailService';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = 'public/order-revision-files';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `revision_file_${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

export class RevisionController {
  // Store revision request
  static async store(req: AuthRequest, res: Response) {
    try {
      const { order_id, service_id, message, transaction_id } = req.body;

      // Validation
      if (!order_id || !service_id || !message) {
        return res.status(400).json({ 
          error: 'Order ID, service ID, and message are required' 
        });
      }

      // Find order item
      const orderItem = await OrderItem.findOne({
        where: {
          service_id: service_id,
          order_id: order_id
        }
      });

      if (!orderItem) {
        return res.status(404).json({ error: 'Order item not found' });
      }

      // Check if max revisions reached
      if (orderItem.max_revision <= 0) {
        return res.status(404).json({ error: 'Max revision reached' });
      }

      let revision;

      if (transaction_id) {
        // Update existing revision
        revision = await Revision.findOne({
          where: {
            service_id: service_id,
            order_id: order_id,
            transaction_id: transaction_id
          }
        });

        if (revision) {
          revision.message = message;
          revision.admin_is_read = 0;
          await revision.save();
        }
      }

      if (!revision) {
        // Create new revision
        revision = await Revision.create({
          order_id: order_id,
          service_id: service_id,
          user_id: req.user!.id,
          message: message,
          status: 'pending',
          admin_is_read: 0,
          user_is_read: 0
        });
      }

      // Decrease max revision count
      orderItem.max_revision = orderItem.max_revision - 1;
      await orderItem.save();

      // Update order status
      const order = await Order.findByPk(order_id);
      if (order) {
        order.Order_status = 4;
        await order.save();
      }

      // Get user
      const user = await User.findByPk(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Send emails
      const userUrl = process.env['FRONTEND_URL'];
      const adminUrl = process.env['ADMIN_URL'];

      // Email to user
      sendRevisionSuccessEmail({
        name: `${user.first_name} ${user.last_name}`,
        order_id: order_id,
        service_id: service_id,
        amount: 0, // Add amount field as required by the function
        url: `${userUrl}/order/${order_id}`,
        message: 'Your Revision Request has been sent Successfully. Our Engineers are working on it:',
        email: user.email
      });

      // Email to admin
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        sendRevisionSuccessEmail({
          name: `${admin.first_name} ${admin.last_name}`,
          order_id: order_id,
          service_id: service_id,
          amount: 0, // Add amount field as required by the function
          url: `${adminUrl}/order-detail/${order_id}`,
          message: 'New Revision Request has been Arrived Successfully. All the Engineer has been notified:',
          email: admin.email
        });
      }

      // Email to engineers
      const engineers = await User.findAll({ where: { role: 'engineer' } });
      for (const engineer of engineers) {
        sendRevisionSuccessEmail({
          name: `${engineer.first_name} ${engineer.last_name}`,
          order_id: order_id,
          service_id: service_id,
          amount: 0, // Add amount field as required by the function
          url: `${adminUrl}/order-detail/${order_id}`,
          message: 'New Revision Request has been Arrived Successfully. You can check by clicking the link below:',
          email: engineer.email
        });
      }

      // Get all revisions for this order
      const allRevisions = await Revision.findAll({
        where: { order_id: order_id }
      });

      return res.json({
        message: 'success',
        Order_status: 4,
        max_count: orderItem.max_revision,
        revision: allRevisions
      });

    } catch (error) {
      console.error('Revision store error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Upload revision files
  static async upload(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { links } = req.body;

      if (!links || !Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ error: 'Links array is required' });
      }

      // Find revision
      const revision = await Revision.findByPk(id);
      if (!revision) {
        return res.status(404).json({ error: 'No data found' });
      }

      // Get existing files
      let existingFiles: string[] = [];
      if (revision.files) {
        try {
          existingFiles = JSON.parse(revision.files);
        } catch (e) {
          existingFiles = [];
        }
      }

      // Combine existing files and new links
      const allFiles = [...existingFiles, ...links];
      revision.files = JSON.stringify(allFiles);

      // Update order status
      const order = await Order.findByPk(revision.order_id);
      if (order) {
        order.Order_status = 2;
        await order.save();
      }

      // Mark revision as unread for user
      revision.user_is_read = 0;
      await revision.save();

      // Get user
      const user = await User.findByPk(revision.user_id);
      if (user) {
        const userUrl = process.env['FRONTEND_URL'];
        const adminUrl = process.env['ADMIN_URL'];

        // Email to user
        sendRevisionSuccessEmail({
          name: `${user.first_name} ${user.last_name}`,
          order_id: revision.order_id,
          service_id: revision.service_id,
          amount: 0, // Add amount field as required by the function
          url: `${userUrl}/order/${revision.order_id}`,
          message: 'Your Revision File has been Delivered Successfully:',
          email: user.email
        });

        // Email to admin
        const admin = await User.findOne({ where: { role: 'admin' } });
        if (admin) {
          sendRevisionSuccessEmail({
            name: `${admin.first_name} ${admin.last_name}`,
            order_id: revision.order_id,
            service_id: revision.service_id,
            amount: 0, // Add amount field as required by the function
            url: `${adminUrl}/order-detail/${revision.order_id}`,
            message: 'New Revision file has been Arrived Successfully:',
            email: admin.email
          });
        }
      }

      // Get all revisions for this order
      const allRevisions = await Revision.findAll({
        where: { order_id: revision.order_id }
      });

      return res.json({
        revision: allRevisions,
        order_status: 2
      });

    } catch (error) {
      console.error('Revision upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Flag admin read status
  static async flagAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { admin_is_read, order_item_id, type } = req.body;

      // Convert string to boolean if needed
      let adminIsRead: boolean;
      if (typeof admin_is_read === 'string') {
        adminIsRead = admin_is_read === '1' || admin_is_read === 'true';
      } else if (typeof admin_is_read === 'boolean') {
        adminIsRead = admin_is_read;
      } else {
        return res.status(400).json({ error: 'Admin Is Read status must be a valid boolean or string' });
      }

      if (!order_item_id) {
        return res.status(400).json({ error: 'Order item ID is required' });
      }

      if (!type || !['order', 'revision'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either order or revision' });
      }

      let data: any = null;
      let response: any = null;

      if (type === 'order') {
        data = await OrderItem.findOne({
          where: {
            order_id: id,
            id: order_item_id
          }
        });
      } else if (type === 'revision') {
        const orderItem = await OrderItem.findOne({
          where: {
            order_id: id,
            id: order_item_id
          }
        });

        if (orderItem) {
          data = await Revision.findOne({
            where: {
              order_id: id,
              service_id: orderItem.service_id,
              admin_is_read: 0
            }
          });
        }
      }

      if (!data) {
        return res.status(404).json({ error: 'No data found' });
      }

      data.admin_is_read = adminIsRead ? 1 : 0;
      await data.save();

      if (type === 'order') {
        response = await OrderItem.findAll({
          where: { order_id: id }
        });
      } else if (type === 'revision') {
        response = await Revision.findAll({
          where: { order_id: id }
        });
      }

      return res.json(response);

    } catch (error) {
      console.error('Flag admin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Flag user read status
  static async flagUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { user_is_read, order_item_id, type } = req.body;

      // Convert string to boolean if needed
      let userIsRead: boolean;
      if (typeof user_is_read === 'string') {
        userIsRead = user_is_read === '1' || user_is_read === 'true';
      } else if (typeof user_is_read === 'boolean') {
        userIsRead = user_is_read;
      } else {
        return res.status(400).json({ error: 'User Is Read status must be a valid boolean or string' });
      }

      if (!order_item_id) {
        return res.status(400).json({ error: 'Order Item ID is required' });
      }

      if (!type || !['order', 'revision'].includes(type)) {
        return res.status(400).json({ error: 'Type must be either order or revision' });
      }

      let data: any = null;
      let response: any = null;

      if (type === 'order') {
        data = await OrderItem.findOne({
          where: {
            order_id: id,
            id: order_item_id
          }
        });
      } else if (type === 'revision') {
        const orderItem = await OrderItem.findOne({
          where: {
            order_id: id,
            id: order_item_id
          }
        });

        if (orderItem) {
          data = await Revision.findOne({
            where: {
              order_id: id,
              service_id: orderItem.service_id,
              user_is_read: 0
            }
          });
        }
      }

      if (!data) {
        return res.status(404).json({ error: 'No data found' });
      }

      data.user_is_read = userIsRead ? 1 : 0;
      await data.save();

      if (type === 'order') {
        response = await OrderItem.findAll({
          where: { order_id: id }
        });
      } else if (type === 'revision') {
        response = await Revision.findAll({
          where: { order_id: id }
        });
      }

      return res.json(response);

    } catch (error) {
      console.error('Flag user error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }

  // Get revision data (placeholder - you may need to create a RevisionData model)
  static async getData(_req: AuthRequest, res: Response) {
    try {
      // This is a placeholder - you may need to implement based on your needs
      return res.json({ message: 'Revision data endpoint' });
    } catch (error) {
      console.error('Get revision data error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

// Export multer upload for use in routes
export { upload }; 