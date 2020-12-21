#include <bits/stdc++.h>
typedef long long int ll;
using namespace std;
int32_t main(){
    int t;
    cin >> t;
    while(t--) {
        ll n;
        cin >> n;
        vector<ll> v(n);
        for(int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        for(int i = 0; i < n; ++i) {
            cout << v[i] << ' ';
        }
        cout << "done \n";
    }
}