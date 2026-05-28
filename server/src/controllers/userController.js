export const getUserProblems = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const problems = await prisma.problem.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const formattedProblems = problems.map(problem => ({
    ...problem,
    tags: problem.tags.map(pt => pt.tag.name),
  }));

  res.status(200).json({
    success: true,
    problems: formattedProblems,
  });
});
