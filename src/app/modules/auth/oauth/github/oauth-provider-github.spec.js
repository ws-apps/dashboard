describe('Factory: oauthProviderGitHub', function() {
    var oauthProviderGitHub,
    $httpBackend,
    $q,
    $window,
    githubOauth;

    beforeEach(function(){
        module(function($provide){
            $provide.constant('AUTH_API_URL', 'api url');
            $provide.constant('GITHUB_CLIENT_ID', 'github client id');
        });
        module('ui.router');
        module('qorDash.auth.oauth');
    });
    beforeEach(inject(function(_oauthProviderGitHub_, _$httpBackend_, _$q_, _$window_, $state, _githubOauth_){
        oauthProviderGitHub = _oauthProviderGitHub_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
        $window = _$window_;
        githubOauth = _githubOauth_;

        spyOn($state, 'go').and.returnValue(true);
    }));
    beforeEach(function(){
        spyOn($window, 'open').and.returnValue({});
    });

    describe('login', function() {
        it('returns a promise', function(){
            expect(typeof oauthProviderGitHub.login().then).toBe('function');
        });
        it('calls githubOauth.openPopup', function(){
            spyOn(githubOauth, 'openPopup');

            oauthProviderGitHub.login();

            expect(githubOauth.openPopup).toHaveBeenCalled();
        });
    });
    describe('exchangeToken', function() {
        it('returns a promise', function(){
            expect(typeof oauthProviderGitHub.exchangeToken(123).then).toBe('function');
        });
    });
});
