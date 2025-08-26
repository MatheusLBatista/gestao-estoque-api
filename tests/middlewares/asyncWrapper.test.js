import asyncWrapper from '../../src/middlewares/asyncWrapper.js';

describe('asyncWrapper', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call the handler with req, res, next', async () => {
    const handler = jest.fn().mockResolvedValue('success');
    const wrappedHandler = asyncWrapper(handler);

    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when handler throws', async () => {
    const error = new Error('Test error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = asyncWrapper(handler);

    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should call next with error when handler rejects promise', async () => {
    const error = new Error('Promise rejection error');
    const handler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = asyncWrapper(handler);

    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle async handler that resolves successfully', async () => {
    const handler = jest.fn(async (req, res, next) => {
      res.status = 200;
      return 'async success';
    });
    const wrappedHandler = asyncWrapper(handler);

    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(res.status).toBe(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle non-promise return value', async () => {
    const handler = jest.fn(() => 'sync return');
    const wrappedHandler = asyncWrapper(handler);

    await wrappedHandler(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
