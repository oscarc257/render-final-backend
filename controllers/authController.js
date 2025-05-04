// Import necessary modules
import prisma from "../constats/config.js"; // Prisma client for database operations
import bcrypt from "bcrypt"; // Library for hashing passwords
import { z } from "zod"; // Library for schema validation

// Login function
const auth_login = async (req, res) => {
  let user;
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    res.status(400).json({ message: "Fields Missing" });
    return;
  }

  try {
    // Find user by email in the database
    user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Check if the provided password matches the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      // Add user ID to the session for authentication
      req.session.userId = user.id;
      res.status(200).send("Authed");
    } else {
      // If password is incorrect, return an error
      res.status(400).json({ message: "Invalid Creditantials" });
    }
  } catch (e) {
    // Handle errors, including when the user is not found
    if (!user) res.status(400).json({ message: "Invalid Creditantials" });
    else res.status(400).json({ message: "Something went Wrong" });
  }
};

// Register function
const auth_register = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Define schema for validating the request body
  const schema = z.object({
    email: z.string().email({ message: "Invalid Email" }),
    password: z
      .string()
      .min(3, { message: "Password must be at least 3 characters" }),
    firstName: z
      .string()
      .min(2, { message: "First Name must be at least 2 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last Name must be at least 2 characters" }),
  });

  // Validate the request body against the schema
  const isValid = schema.safeParse(req.body);
  if (isValid?.error) {
    res.status(400).json({ errors: isValid?.error?.errors });
    return;
  }

  let emailCheck;
  try {
    // Check if the email already exists in the database
    emailCheck = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  } catch {
    // Handle database errors
    res.status(500).json({ message: "Something went wrong" });
  }

  // If email already exists, return an error
  if (emailCheck) res.status(500).json({ message: "Email already exists" });
  else {
    const saltRounds = 10; // Number of salt rounds for hashing
    let salted_password = await bcrypt.hash(password, saltRounds); // Hash the password
    let newUser;

    try {
      // Create a new user in the database
      newUser = await prisma.user.create({
        data: {
          email: email,
          password: salted_password,
          firstName: firstName,
          lastName: lastName,
        },
      });

      // Create default transaction categories for the new user
      await prisma.transactionCategory.createMany({
        data: [
          {
            name: "Products",
            userId: newUser.id,
          },
          {
            name: "Entertainment",
            userId: newUser.id,
          },
          {
            name: "Bills",
            userId: newUser.id,
          },
        ],
      });

      // Respond with the new user's ID
      res.status(200).json({ userId: newUser.id });
    } catch (e) {
      // Handle errors during user creation
      console.log(e);
      res.status(500).json({ message: "Something Went Wrong" });
      return;
    }
  }
};

// Logout function
const auth_logout = async (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) res.status(500).send("Cannot destroy session");
    else res.status(200).send("Deleted");
  });
};

// Get authenticated user details
const auth_user = async (req, res) => {
  try {
    // Find the user by their session ID
    const user = await prisma.user.findUnique({
      where: {
        id: req.session.userId,
      },
    });

    // If user is not found, return an error
    if (!user) res.status(401).json("User Not Found");

    // Respond with user details
    const data = {
      email: user.email,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    res.status(200).json(data);
  } catch {
    // Handle errors
    res.status(500).json("Something Went Wrong {auth}");
  }
};

// Export the controller functions
export { auth_register, auth_login, auth_logout, auth_user };
