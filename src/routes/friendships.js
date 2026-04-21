const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

//send a friend request
router.post('/', async (req, res) => {
  const { requesterId, addresseeId } = req.body

  if (!requesterId || !addresseeId) {
    return res.status(400).json({ error: 'requesterId and addresseeId are required' })
  }

  try {
    if (!await prisma.user.findUnique({ where: { id: requesterId } })) {
      return res.status(404).json({ error: 'Requester not found' })
    }

    if (!await prisma.user.findUnique({ where: { id: addresseeId } })) {
      return res.status(404).json({ error: 'Addressee not found' })
    }

    const existing = await prisma.friendship.findUnique({
      where: {
        requesterId_addresseeId: { requesterId, addresseeId }
      }
    })

    if (existing) {
      return res.status(409).json({ error: 'Friendship already exists' })
    }

    const friendship = await prisma.friendship.create({
      data: { requesterId, addresseeId }
    })

    res.status(201).json(friendship)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//accept or reject a friend request
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { userId, status } = req.body

  if (!userId || !status) {
    return res.status(400).json({ error: 'userId and status are required' })
  }

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'status must be ACCEPTED or REJECTED' })
  }

  try {
    const friendship = await prisma.friendship.findUnique({ where: { id } })

    if (!friendship) {
      return res.status(404).json({ error: 'Friendship not found' })
    }

    if (friendship.addresseeId !== userId) {
      return res.status(403).json({ error: 'Only the recipient can respond to a friend request' })
    }

    if (friendship.status !== 'PENDING') {
      return res.status(409).json({ error: 'This request has already been responded to' })
    }

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status }
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//get friends list for a user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId },
          { addresseeId: userId }
        ],
        status: 'ACCEPTED'
      },
      include: {
        requester: true,
        addressee: true
      }
    })

    res.json(friendships)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router