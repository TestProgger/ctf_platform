from math import sqrt, pow
PHI = ( 1 + sqrt(5))/2
 
def fib(n):
    return int(( pow( PHI , n ) - pow(-PHI , -n) ) / ( 2*PHI - 1 ))


for i in range(1,500):
    Fnm1 = fib(i - 1)
    Fnp1 = fib(i + 1)
    Fn = fib( i )

    print(f"{Fnm1} * {Fnp1} - {Fn}^2 = {Fnp1 * Fnm1 - pow( Fn, 2 )}")