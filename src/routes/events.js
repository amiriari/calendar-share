const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

//get event
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    res.json(event)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//get all events for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const events = await prisma.event.findMany({
      where: { userId },
      include: { user: true }
    })

    res.json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//create new event
router.post('/', async (req, res) => {
  const { name, dayOfWeek, startHour, endHour, userId } = req.body

  //validation: make sure required fields present
  if (!name || dayOfWeek === undefined || startHour === undefined || endHour === undefined || !userId) {
    return res.status(400).json({
      error: 'name, dayOfWeek, startHour, endHour, and userId are required'
    })
  }

  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    return res.status(400).json({
      error: 'startHour and endHour must be between 0 and 23'
    })
  }

  if (startHour >= endHour) {
    return res.status(400).json({
      error: 'startHour must be less than endHour'
    })
  }

  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({
      error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'
    })
  }

  try {
    const event = await prisma.event.create({
      data: { name, dayOfWeek, startHour, endHour, userId }
    })

    res.status(201).json(event)
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//delete event
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const { userId } = req.body  //who is asking?

  try {
    //find event first
    const event = await prisma.event.findUnique({ where: { id } })

    //does it exist?
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }

    //does the requester own it?
    if (event.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this event' })
    }

    //safe to delete
    await prisma.event.delete({ where: { id } })

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router