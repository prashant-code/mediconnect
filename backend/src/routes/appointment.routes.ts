import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const appointmentController = new AppointmentController();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - dateTime
 *               - reason
 *             properties:
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-15T10:00:00Z
 *               reason:
 *                 type: string
 *                 example: Regular checkup
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Time slot not available or invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', appointmentController.create);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments for the authenticated user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized
 */
router.get('/', appointmentController.list);

/**
 * @swagger
 * /api/appointments/available-slots:
 *   get:
 *     summary: Get available time slots for a doctor
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor's ID
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for slot search
 *         example: 2024-01-15
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for slot search (defaults to 7 days from startDate)
 *         example: 2024-01-22
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       dateTime:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:00:00Z
 *                       available:
 *                         type: boolean
 *                         example: true
 *       400:
 *         description: Missing required parameters
 *       401:
 *         description: Unauthorized
 */
router.get('/available-slots', appointmentController.getAvailableSlots);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 example: Feeling better
 *                 description: Optional reason for cancellation
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Cannot cancel (less than 24 hours before appointment)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id/cancel', appointmentController.cancel);

/**
 * @swagger
 * /api/appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newDateTime
 *             properties:
 *               newDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-01-20T14:00:00Z
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Cannot reschedule (less than 24 hours or new slot unavailable)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.patch('/:id/reschedule', appointmentController.reschedule);

/**
 * @swagger
 * /api/appointments/{id}/notes:
 *   post:
 *     summary: Add a note to an appointment (Doctor only)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Patient shows improvement in symptoms
 *     responses:
 *       201:
 *         description: Note added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only doctors can add notes
 *       404:
 *         description: Appointment not found
 */
router.post('/:id/notes', appointmentController.addNote);

export default router;
