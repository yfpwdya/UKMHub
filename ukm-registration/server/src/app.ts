import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { questionnaireRouter } from './routes/questionnaire';
import { ukmRouter } from './routes/ukm';
import { registrationRouter } from './routes/registration';
import { adminAuthRouter } from './routes/adminAuth';
import { adminRouter } from './routes/admin';
import { athleteRouter } from './routes/athlete';
import { scheduleRouter } from './routes/schedule';
import { interviewRouter } from './routes/interview';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/questionnaire', questionnaireRouter);
app.use('/api/ukm', ukmRouter);
app.use('/api/registration', registrationRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/athlete', athleteRouter);
app.use('/api/schedules', scheduleRouter);
app.use('/api/interview', interviewRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '2.0' }));

app.listen(PORT, () => {
  console.log(`Server UKMHub berjalan di http://localhost:${PORT}`);
});

export default app;
