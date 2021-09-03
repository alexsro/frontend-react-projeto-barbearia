import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import { AuthProvider, useAuth } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('shoud be able to signIn', async () => {
    const apiResponse = {
      user: {
        id: 'user123',
        name: 'teste',
        email: 'teste@gmail.com.br',
      },
      token: '123',
    };

    apiMock.onPost('sessions').reply(200, apiResponse);

    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    result.current.signIn({
      email: 'teste@gmail.com.br',
      password: '123',
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith('@GoBarber:token', apiResponse.token);
    expect(setItemSpy).toHaveBeenCalledWith('@GoBarber:user', JSON.stringify(apiResponse.user));
    expect(result.current.user.email).toEqual('teste@gmail.com.br');
  });

  it('shoud restore saved data from storage on init', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case '@GoBarber:token':
          return '123';
        case '@GoBarber:user':
          return JSON.stringify({
            id: 'user123',
            name: 'teste',
            email: 'teste@gmail.com.br',
          });
        default:
          return null;
      }
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user.email).toEqual('teste@gmail.com.br');
  });

  it('shoud be able to sign out', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      switch (key) {
        case '@GoBarber:token':
          return '123';
        case '@GoBarber:user':
          return JSON.stringify({
            id: 'user123',
            name: 'teste',
            email: 'teste@gmail.com.br',
          });
        default:
          return null;
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    expect(removeItemSpy).toHaveBeenCalledTimes(2);
    expect(result.current.user).toBeUndefined();
  });

  it('shoud be able to update user data', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const user = {
      id: 'user123',
      name: 'teste',
      email: 'teste@gmail.com.br',
      avatar_url: 'testeimagems.jpg',
    };

    act(() => {
      result.current.updateUser(user);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(user),
    );
    expect(result.current.user).toEqual(user);
  });
});
