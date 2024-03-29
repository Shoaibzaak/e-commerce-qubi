// register.test.js

const { register } = require("../../controllers/Customer/UserAuthController");
const Model = require("../../models/index");
const { validation } = require("../validations/validation");
const validatePassword = require("../validatePassword");
const catchAsync=require("../catchAsync")
// Mock dependencies if needed

// Mock dependencies if needed
// Import or mock Validation, validatePassword, encrypt, otpService, Model, Services.EmailService, etc.

describe("Register Function", () => {
// Create a test case
// Mock an asynchronous function that throws an error
test('catchAsync handles errors correctly', async () => {
  const asyncFunction = async () => {
    throw new Error('Test error');
  };
  
  // Mock Express request, response, and next functions
  const req = {};
  const res = {};
  const next = jest.fn(); // Define the next function using jest.fn()
  
  // Wrap the async function with catchAsync
  const wrappedAsyncFunction = catchAsync(asyncFunction);

  // Call the wrapped async function with mocked req, res, and next
  await wrappedAsyncFunction(req, res, next);

  // Expect the next function to be called with the error
  expect(next).toHaveBeenCalledWith(expect.any(Error));
});


  test("handles invalid email format", async () => {
    // Implement a test for the case where email validation fails
    // You can mock the Validation module to return false for validateEmail
    // and then check if res.badRequest is called with the expected message
    const req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "invalid-email",
        password: "strongpassword",
      },
    };
    const res = {
      ok: jest.fn(),
      badRequest: jest.fn(),
    };
    const next = jest.fn();

    // Mock validateEmail to always return false for simplicity in this example
    jest.mock(validation, () => ({
      validateEmail: jest.fn().mockReturnValue(false),
    }));

    // Call the register function
    await register(req, res, next);

    // Assertions
    expect(res.badRequest).toHaveBeenCalledWith("Invalid email format");
    // Add more specific assertions based on the expected behavior of your code
  });
});
describe("validatePassword Function", () => {
  // check the weak password
  test("returns false for weak password", async () => {
    const payload = {
      password: "password",
    };

    const result = await validatePassword(payload);

    expect(result).toBe(false);
  });

  test('returns false for existing password (userId)', async () => {
    // Mocking Model.User.find to return an existing password for the specified userId
    jest.spyOn(Model.User, 'find').mockResolvedValueOnce([
      { comparePassword: jest.fn().mockResolvedValue(true) }
    ]);
  
    const payload = {
      password: 'strongPassword123$',
      userId: 'someUserId',
    };
  
    const result = await validatePassword(payload);
  
    // Expect the result to be false since the provided password matches an existing password
    expect(result).toBe(false);
  });
});
