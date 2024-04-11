const request = require('supertest');
const app = require('../app');

describe('Tasks API', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', description: 'This is a test task', user_id: 1 });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Task created successfully');
  });
});
