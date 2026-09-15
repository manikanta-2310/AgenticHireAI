import Candidate from '../models/Candidate.js';
import Job from '../models/Job.js';
import Workflow from '../models/Workflow.js';
import WorkflowLog from '../models/WorkflowLog.js';

export const getRecruiterAnalytics = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const totalWorkflows = await Workflow.countDocuments();

    const shortlistedCount = await Candidate.countDocuments({
      status: { $in: ['approved', 'interview_scheduled'] },
    });
    const rejectedCount = await Candidate.countDocuments({ status: 'rejected' });
    const pendingApprovalCount = await Workflow.countDocuments({ status: 'waiting_approval' });

    const shortlistRate = totalCandidates > 0 ? Math.round((shortlistedCount / totalCandidates) * 100) : 0;

    // Agent execution metrics from logs
    const agentMetrics = await WorkflowLog.aggregate([
      {
        $group: {
          _id: '$agent_name',
          totalRuns: { $sum: 1 },
          avgDuration: { $avg: '$duration_ms' },
          failures: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
          },
          successes: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          }
        }
      }
    ]);

    // Average match score
    const avgScoreResult = await Candidate.aggregate([
      { $match: { match_score: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$match_score' } } }
    ]);
    const averageMatchScore = avgScoreResult[0] ? Math.round(avgScoreResult[0].avgScore) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalJobs,
          totalCandidates,
          totalWorkflows,
          shortlistedCount,
          rejectedCount,
          pendingApprovalCount,
          shortlistRate,
          averageMatchScore,
        },
        agentMetrics,
      },
    });
  } catch (err) {
    next(err);
  }
};
