const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

//get user
router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

//create new user
router.post('/', async (req, res) => {
  const { email, name, inviteCode } = req.body

  //validation: make sure required fields present
  if (!email || !name || !inviteCode) {
    return res.status(400).json({ 
      error: 'email, name, and inviteCode are required' 
    })
  }

  try {
    const user = await prisma.user.create({
      data: { email, name, inviteCode }
    })

    res.status(201).json(user)
  } catch (error) {
    //Prisma's code for unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'A user with that email or inviteCode already exists' 
      })
    }
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

module.exports = router