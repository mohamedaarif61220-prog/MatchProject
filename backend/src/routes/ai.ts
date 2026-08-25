import { Router, Request, Response } from 'express';
import { geminiService } from '../services/gemini';

const router = Router();

/**
 * Endpoint: POST /api/analyze
 * Payload: { description: string }
 */
router.post('/analyze', async (req: Request, res: Response) => {
  const { description } = req.body;
  
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: "Invalid payload. 'description' string is required." });
  }

  try {
    const analysis = await geminiService.analyzeProjectDescription(description);
    return res.json(analysis);
  } catch (error: any) {
    console.error("Route error in /api/analyze:", error);
    return res.status(500).json({ error: error.message || "Project analysis failed." });
  }
});

/**
 * Endpoint: POST /api/explain-match
 * Payload: { requiredSkills: string[], requiredRoles: string[], candidate: object, deterministicScores: object }
 */
router.post('/explain-match', async (req: Request, res: Response) => {
  const { requiredSkills, requiredRoles, candidate, deterministicScores } = req.body;

  if (!requiredSkills || !requiredRoles || !candidate || !deterministicScores) {
    return res.status(400).json({ 
      error: "Missing parameters. Required fields: 'requiredSkills', 'requiredRoles', 'candidate', 'deterministicScores'." 
    });
  }

  try {
    const explanation = await geminiService.explainCandidateMatch(
      requiredSkills,
      requiredRoles,
      candidate,
      deterministicScores
    );
    return res.json({ explanation });
  } catch (error: any) {
    console.error("Route error in /api/explain-match:", error);
    return res.status(500).json({ error: error.message || "Failed to generate match explanation." });
  }
});

/**
 * Endpoint: POST /api/improve-team
 * Payload: { project: { requiredSkills: string[], requiredRoles: string[] }, currentTeam: array, candidatesPool: array }
 */
router.post('/improve-team', async (req: Request, res: Response) => {
  const { project, currentTeam, candidatesPool } = req.body;

  if (!project || !currentTeam || !candidatesPool) {
    return res.status(400).json({
      error: "Missing parameters. Required fields: 'project', 'currentTeam', 'candidatesPool'."
    });
  }

  const requiredSkills = project.requiredSkills || [];
  const requiredRoles = project.requiredRoles || [];

  try {
    const recommendation = await geminiService.recommendTeamImprovement(
      requiredSkills,
      requiredRoles,
      currentTeam,
      candidatesPool
    );
    return res.json(recommendation);
  } catch (error: any) {
    console.error("Route error in /api/improve-team:", error);
    return res.status(500).json({ error: error.message || "Failed to generate team improvement recommendation." });
  }
});

export default router;
