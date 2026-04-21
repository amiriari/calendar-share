const express = require('express')
const { prisma } = require('../lib/prisma')

const router = express.Router()

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

module.exports = router