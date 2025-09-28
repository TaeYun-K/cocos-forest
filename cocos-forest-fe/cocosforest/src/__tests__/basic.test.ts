// Basic test to check if Jest is working
describe('Basic Jest Setup', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});