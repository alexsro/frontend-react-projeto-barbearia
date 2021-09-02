import { renderHook } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../../hooks/auth';

describe('Auth hook', () => {
  it('shoud be able to signIn', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'teste@gmail.com',
      password: '123',
    });

    expect(result.current.user.email).toEqual('teste@gmail.com');
  });
});
