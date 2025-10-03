import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import Event from '../models/Event';
import Ticket from '../models/Ticket';
import { authenticate, AuthRequest, authorize, requireApproval } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    // This would typically come from a notifications collection
    // For now, we'll generate notifications based on user data
    const notifications = [];

    // Check for pending approvals
    if (req.user!.role === 'organizer' && !req.user!.isApproved) {
      notifications.push({
        id: 'approval-pending',
        type: 'warning',
        title: 'Account Pending Approval',
        message: 'Your organizer account is pending approval from an administrator.',
        createdAt: req.user!.createdAt,
        read: false
      });
    }

    // Check for recent events
    const recentEvents = await Event.find({
      organization: req.user!.organization,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(5);

    recentEvents.forEach(event => {
      notifications.push({
        id: `event-${event._id}`,
        type: 'info',
        title: 'New Event Created',
        message: `Event "${event.title}" has been created.`,
        createdAt: event.createdAt,
        read: false
      });
    });

    // Check for ticket sales
    if (req.user!.role === 'organizer') {
      const recentTickets = await Ticket.find({
        event: { $in: await Event.find({ createdBy: req.user!._id }).distinct('_id') },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).populate('event', 'title');

      recentTickets.forEach(ticket => {
        notifications.push({
          id: `ticket-${ticket._id}`,
          type: 'success',
          title: 'New Ticket Sale',
          message: `Ticket sold for "${(ticket.event as any).title}".`,
          createdAt: ticket.createdAt,
          read: false
        });
      });
    }

    res.json({
      notifications: notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/mark-read
// @desc    Mark notification as read
// @access  Private
router.post('/mark-read', authenticate, [
  body('notificationId').isString()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notificationId } = req.body;

    // In a real implementation, you would update the notification in the database
    // For now, we'll just return success
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/send
// @desc    Send notification to users
// @access  Private (Admin)
router.post('/send', authenticate, authorize('admin'), [
  body('title').trim().notEmpty(),
  body('message').trim().notEmpty(),
  body('type').isIn(['info', 'warning', 'success', 'error']),
  body('targetUsers').optional().isArray(),
  body('targetRoles').optional().isArray()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, targetUsers, targetRoles } = req.body;

    // In a real implementation, you would:
    // 1. Create notification records in the database
    // 2. Send push notifications
    // 3. Send emails
    // 4. Send SMS if configured

    res.json({ 
      message: 'Notifications sent successfully',
      sentTo: targetUsers?.length || 'all users'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private (Admin)
router.get('/stats', authenticate, authorize('admin'), async (req: AuthRequest, res: express.Response) => {
  try {
    // In a real implementation, you would query notification statistics
    const stats = {
      totalNotifications: 0,
      unreadNotifications: 0,
      notificationsByType: {
        info: 0,
        warning: 0,
        success: 0,
        error: 0
      },
      recentActivity: []
    };

    res.json(stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
