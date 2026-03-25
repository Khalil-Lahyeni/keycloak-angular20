isAuthenticated(): Observable<boolean> {
    return this.http
      .get<UserInfo>(`${environment.apiGatewayUrl}/api/auth/userinfo`, {
        withCredentials: true
      })
      .pipe(
        map((user) => {
          this._user.set(user);  // met à jour le signal en même temps
          return true;
        }),
        catchError(() => {
          this._user.set(null);
          return of(false);
        })
      );
  }
  
