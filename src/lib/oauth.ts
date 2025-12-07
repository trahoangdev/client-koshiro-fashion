// OAuth utilities for Google and Facebook login

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    FB?: {
      init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            accessToken: string;
            userID: string;
          };
          status: string;
        }) => void,
        options?: { scope: string }
      ) => void;
      getLoginStatus: (
        callback: (response: {
          status: string;
          authResponse?: {
            accessToken: string;
            userID: string;
          };
        }) => void
      ) => void;
    };
  }
}

// Initialize Google Sign-In
export const initGoogleSignIn = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    // Wait for Google script to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogle);
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkGoogle);
      if (!window.google) {
        reject(new Error('Google Sign-In failed to load'));
      }
    }, 10000);
  });
};

// Get Google access token
export const getGoogleToken = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Sign-In not initialized'));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'email profile',
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject(new Error('Failed to get Google token'));
        }
      },
    });

    client.requestAccessToken();
  });
};

// Initialize Facebook SDK
export const initFacebookSDK = (appId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
      resolve();
      return;
    }

    // Wait for Facebook SDK to load
    const checkFB = setInterval(() => {
      if (window.FB) {
        clearInterval(checkFB);
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        resolve();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkFB);
      if (!window.FB) {
        reject(new Error('Facebook SDK failed to load'));
      }
    }, 10000);
  });
};

// Get Facebook access token
export const getFacebookToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error('Facebook SDK not initialized'));
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse && response.authResponse.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Facebook login failed or was cancelled'));
        }
      },
      { scope: 'email,public_profile' }
    );
  });
};

