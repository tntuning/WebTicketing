import express from 'express';
import { query, validationResult } from 'express-validator';
import User from '../models/User';
import Event from '../models/Event';
import Ticket from '../models/Ticket';
import Organization from '../models/Organization';
import { authenticate, AuthRequest, authorize, requireApproval } from '../middleware/auth';
import * as createCsvWriter from 'csv-writer';

const router = express.Router();

// @route   GET /api/reports/events
// @desc    Export events report
// @access  Private (Admin)
router.get('/events', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
  query('organization').optional().isMongoId()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', startDate, endDate, status, organization } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }
    if (status) filter.status = status;
    if (organization) filter.organization = organization;

    const events = await Event.find(filter)
      .populate('organization', 'name')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: 'events-report.csv',
        header: [
          { id: 'title', title: 'Event Title' },
          { id: 'description', title: 'Description' },
          { id: 'date', title: 'Event Date' },
          { id: 'startTime', title: 'Start Time' },
          { id: 'endTime', title: 'End Time' },
          { id: 'location', title: 'Location' },
          { id: 'category', title: 'Category' },
          { id: 'ticketType', title: 'Ticket Type' },
          { id: 'ticketPrice', title: 'Ticket Price' },
          { id: 'capacity', title: 'Capacity' },
          { id: 'status', title: 'Status' },
          { id: 'isApproved', title: 'Approved' },
          { id: 'organization', title: 'Organization' },
          { id: 'createdBy', title: 'Created By' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = events.map(event => ({
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        category: event.category,
        ticketType: event.ticketType,
        ticketPrice: event.ticketPrice || 0,
        capacity: event.capacity,
        status: event.status,
        isApproved: event.isApproved,
        organization: (event.organization as any).name,
        createdBy: `${(event.createdBy as any).firstName} ${(event.createdBy as any).lastName}`,
        createdAt: event.createdAt.toISOString()
      }));

      await csvWriter.writeRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="events-report.csv"');
      res.download('events-report.csv');
    } else {
      res.json({
        events,
        total: events.length,
        filters: { startDate, endDate, status, organization }
      });
    }
  } catch (error) {
    console.error('Events report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/users
// @desc    Export users report
// @access  Private (Admin)
router.get('/users', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']),
  query('role').optional().isIn(['student', 'organizer', 'admin']),
  query('isApproved').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', role, isApproved, startDate, endDate } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('organization', 'name')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: 'users-report.csv',
        header: [
          { id: 'firstName', title: 'First Name' },
          { id: 'lastName', title: 'Last Name' },
          { id: 'email', title: 'Email' },
          { id: 'role', title: 'Role' },
          { id: 'studentId', title: 'Student ID' },
          { id: 'organization', title: 'Organization' },
          { id: 'isApproved', title: 'Approved' },
          { id: 'phoneNumber', title: 'Phone Number' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = users.map(user => ({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId || '',
        organization: (user.organization as any)?.name || '',
        isApproved: user.isApproved,
        phoneNumber: user.phoneNumber || '',
        createdAt: user.createdAt.toISOString()
      }));

      await csvWriter.writeRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users-report.csv"');
      res.download('users-report.csv');
    } else {
      res.json({
        users,
        total: users.length,
        filters: { role, isApproved, startDate, endDate }
      });
    }
  } catch (error) {
    console.error('Users report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/tickets
// @desc    Export tickets report
// @access  Private (Admin)
router.get('/tickets', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']),
  query('status').optional().isIn(['active', 'used', 'cancelled', 'expired']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('eventId').optional().isMongoId()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', status, startDate, endDate, eventId } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const tickets = await Ticket.find(filter)
      .populate('event', 'title date location organization')
      .populate('user', 'firstName lastName email studentId')
      .populate('usedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: 'tickets-report.csv',
        header: [
          { id: 'ticketId', title: 'Ticket ID' },
          { id: 'eventTitle', title: 'Event Title' },
          { id: 'eventDate', title: 'Event Date' },
          { id: 'eventLocation', title: 'Event Location' },
          { id: 'organization', title: 'Organization' },
          { id: 'userName', title: 'User Name' },
          { id: 'userEmail', title: 'User Email' },
          { id: 'studentId', title: 'Student ID' },
          { id: 'status', title: 'Status' },
          { id: 'price', title: 'Price' },
          { id: 'usedAt', title: 'Used At' },
          { id: 'usedBy', title: 'Used By' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = tickets.map(ticket => ({
        ticketId: ticket.ticketId,
        eventTitle: (ticket.event as any).title,
        eventDate: (ticket.event as any).date.toISOString().split('T')[0],
        eventLocation: (ticket.event as any).location,
        organization: (ticket.event as any).organization?.name || '',
        userName: `${(ticket.user as any).firstName} ${(ticket.user as any).lastName}`,
        userEmail: (ticket.user as any).email,
        studentId: (ticket.user as any).studentId || '',
        status: ticket.status,
        price: ticket.price || 0,
        usedAt: ticket.usedAt ? ticket.usedAt.toISOString() : '',
        usedBy: ticket.usedBy ? `${(ticket.usedBy as any).firstName} ${(ticket.usedBy as any).lastName}` : '',
        createdAt: ticket.createdAt.toISOString()
      }));

      await csvWriter.writeRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tickets-report.csv"');
      res.download('tickets-report.csv');
    } else {
      res.json({
        tickets,
        total: tickets.length,
        filters: { status, startDate, endDate, eventId }
      });
    }
  } catch (error) {
    console.error('Tickets report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/organizer/:organizerId
// @desc    Export organizer's events report
// @access  Private (Admin)
router.get('/organizer/:organizerId', authenticate, authorize('admin'), [
  query('format').optional().isIn(['json', 'csv']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { format = 'json', startDate, endDate } = req.query;
    const { organizerId } = req.params;

    const filter: any = { createdBy: organizerId };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const events = await Event.find(filter)
      .populate('organization', 'name')
      .sort({ createdAt: -1 });

    // Get ticket counts for each event
    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const ticketCount = await Ticket.countDocuments({ event: event._id });
        const usedTickets = await Ticket.countDocuments({ event: event._id, status: 'used' });
        const revenue = await Ticket.aggregate([
          { $match: { event: event._id, price: { $gt: 0 } } },
          { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        return {
          ...event.toObject(),
          ticketCount,
          usedTickets,
          revenue: revenue[0]?.total || 0
        };
      })
    );

    if (format === 'csv') {
      const csvWriter = createCsvWriter.createObjectCsvWriter({
        path: 'organizer-events-report.csv',
        header: [
          { id: 'title', title: 'Event Title' },
          { id: 'date', title: 'Event Date' },
          { id: 'location', title: 'Location' },
          { id: 'category', title: 'Category' },
          { id: 'ticketType', title: 'Ticket Type' },
          { id: 'ticketPrice', title: 'Ticket Price' },
          { id: 'capacity', title: 'Capacity' },
          { id: 'ticketCount', title: 'Tickets Issued' },
          { id: 'usedTickets', title: 'Tickets Used' },
          { id: 'revenue', title: 'Revenue' },
          { id: 'status', title: 'Status' },
          { id: 'isApproved', title: 'Approved' },
          { id: 'createdAt', title: 'Created At' }
        ]
      });

      const csvData = eventsWithTickets.map(event => ({
        title: event.title,
        date: event.date.toISOString().split('T')[0],
        location: event.location,
        category: event.category,
        ticketType: event.ticketType,
        ticketPrice: event.ticketPrice || 0,
        capacity: event.capacity,
        ticketCount: event.ticketCount,
        usedTickets: event.usedTickets,
        revenue: event.revenue,
        status: event.status,
        isApproved: event.isApproved,
        createdAt: event.createdAt.toISOString()
      }));

      await csvWriter.writeRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="organizer-events-report.csv"');
      res.download('organizer-events-report.csv');
    } else {
      res.json({
        events: eventsWithTickets,
        total: eventsWithTickets.length,
        filters: { startDate, endDate }
      });
    }
  } catch (error) {
    console.error('Organizer events report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
