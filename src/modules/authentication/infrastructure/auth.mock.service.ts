import type { AuthRepository } from '../domain/auth.repository';
import type {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from '../domain/auth.model';

type MockUser = {
  email: string;
  password: string;
};

class AuthMockService implements AuthRepository {
  private users: MockUser[] = [];

  async signup(data: SignUpPayload): Promise<SignUpResponse | Error> {
    const existing = this.users.find(user => user.email === data.email);
    if (existing) {
      return new Error('User already exists');
    }

    this.users.push({ email: data.email, password: data.password });
    return { user: { email: data.email } };
  }

  async signin(data: SignInPayload): Promise<SignInResponse | Error> {
    const existing = this.users.find(
      user => user.email === data.email && user.password === data.password,
    );
    if (!existing) {
      return new Error('Invalid credentials');
    }

    return { user: { email: data.email } };
  }
}

function createAuthMockService(): AuthRepository {
  return new AuthMockService();
}

export default createAuthMockService();
