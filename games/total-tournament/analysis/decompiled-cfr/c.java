/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Graphics
 */
import javax.microedition.lcdui.Graphics;

public final class c {
    int a = 0;
    private int e;
    private byte f;
    private int g;
    e b;
    private int h;
    private int i;
    private int j;
    private a k = new a();
    private int l;
    private int m;
    private int n;
    private int o;
    private int p;
    private int q;
    private int r;
    private int s;
    private int t;
    byte c;
    private int u;
    private int v;
    private int w;
    private int x;
    private int y;
    private int z;
    private boolean A;
    private String[] B;
    private int C;
    private int D;
    boolean d = false;
    private boolean E = true;
    private int F;
    private int G;
    private int H;
    private String I;
    private int J;
    private int K;
    private int L;
    private int M;
    private String[][] N;
    private int O;
    private int P;
    private int Q;
    private int R;
    private int S;

    public c(e stringArray, String[] stringArray2) {
        if (stringArray2 != null) {
            this.B = new String[stringArray2.length];
            this.z = stringArray2.length;
        }
        this.I = "_";
        int n = 0;
        while (n < this.z) {
            this.B[n] = new String(stringArray2[n]);
            ++n;
        }
        this.b = stringArray;
        if (this.b.K == 0) {
            --this.z;
        }
        this.J = (this.b.e >> 2) + (this.b.e >> 3);
        if (this.b.K == 4 || this.b.K == 19) {
            this.J = this.b.e >> 4;
            this.w = this.b.q.getHeight() + (this.b.q.getHeight() >> 2);
            this.z -= 2;
        }
        this.b.X = 0;
        this.A = false;
        this.d = true;
        if (this.b.K > 10 && this.b.K != 19 && this.b.K != 13 && this.b.K != 14) {
            this.d = false;
        }
        this.e = -this.J;
        this.f = 0;
        this.O = this.b.e / 13;
        this.l = this.b.h[3][33] + 2;
        this.m = this.b.l;
        this.P = this.b.m;
        this.n = this.m >> 1;
        this.o = this.m >> 3;
        this.p = this.m + this.o;
        this.G = 0;
        this.M = this.b.s.a();
        this.x = this.z;
        if (this.b.K == 11 || this.b.K == 12) {
            this.L = this.M;
            this.u = this.b.b - (this.l << 1);
            this.q = this.L * this.z;
        } else {
            this.L = this.p;
            this.u = this.b.b - this.L;
            this.u -= this.b.h[3][33];
            this.q = this.L * this.z >> 1;
        }
        if (this.u < this.q << 1) {
            this.x = this.u / this.L;
            this.q = this.L * this.x >> 1;
        }
        if (this.b.K == 11 || this.b.K == 12) {
            this.x = this.b.b - (this.l << 1) > this.L * this.z ? this.z : --this.x;
        }
        if (this.b.K != 11 && this.b.K != 12 && this.x > 5) {
            this.x = 5;
            this.q = this.L * this.x >> 1;
        }
        this.Q = this.b.f;
        this.t = this.b.c;
        this.h = this.t - this.q;
        this.c = (byte)((this.l >> 1) - (this.M >> 1));
        if (this.b.K == 9) {
            this.x = this.z;
        }
        this.j = this.t - (this.x * this.M >> 1);
        this.S = this.Q - (this.Q >> 1) - this.P - (this.Q >> 3);
        this.R = this.Q + (this.Q >> 1) + (this.Q >> 3);
        if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
            this.c = 0;
            this.g = this.K = 1;
            this.D = 0;
            this.b.C = this.b.e / this.b.w.getWidth() + 1;
            this.J = this.b.e >> 4;
            this.e = -this.J;
            this.L = 22;
            this.z = this.x = this.z - 1;
            this.w = this.q = this.L * this.x;
            this.h = this.k.a() + this.m;
            this.y = this.h + (this.w >> 1);
            this.r = this.b.b - (this.h + this.q + (this.b.w.getHeight() >> 2) + this.b.h[3][33]);
            this.v = this.r / this.M;
            this.i = this.h + this.q + (this.b.w.getHeight() >> 2) + (this.r >> 1) - (this.v * this.M >> 1);
            --this.v;
            if (this.M << 1 >= this.r) {
                this.h = this.k.a();
                this.y = this.h + (this.w >> 1);
                this.E = false;
            }
            stringArray = this.b.a("text3");
            this.N = new String[stringArray.length][];
            n = 0;
            while (n < stringArray.length) {
                stringArray2 = this.b.a(stringArray[n], this.b.e - (this.O << 1) - this.O);
                this.N[n] = new String[stringArray2.length];
                int n2 = 0;
                while (n2 < stringArray2.length) {
                    this.N[n][n2] = new String(stringArray2[n2]);
                    ++n2;
                }
                ++n;
            }
            if (this.b.K == 5) {
                this.z = this.B.length;
                this.J = this.b.e >> 2;
                this.L = this.p;
                this.u = (this.b.b >> 1) + (this.b.b >> 2) - this.L;
                this.q = this.L * this.z >> 1;
                if (this.u < this.q << 1) {
                    this.x = this.u / this.L;
                    this.q = this.L * this.x >> 1;
                }
                if (this.x > 5) {
                    this.x = 5;
                }
                this.q = this.L * this.x >> 1;
                this.h = ((this.b.b >> 1) + (this.b.b >> 2) >> 1) - this.q;
                this.r = this.b.b - (this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + this.b.h[3][33]);
                this.v = this.r / this.M;
                this.i = this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + (this.r >> 1) - (this.v * this.M >> 1);
                this.v -= 2;
                this.E = true;
                if (this.M << 1 >= this.r) {
                    this.E = false;
                }
            }
        }
        if (this.b.K == 20 || this.b.K == 22) {
            this.d = false;
            this.L = this.b.h[3][20] + (this.b.h[3][20] >> 1);
            this.x = this.z = this.b.ab.length;
            this.u = this.b.b - 21;
            this.u -= this.b.h[3][33];
            if (this.u - this.L * this.z < 0) {
                this.x = this.u / this.L;
            }
            this.q = this.L * this.x;
            this.h = 22;
        }
        if (this.b.K == 1) {
            this.d = false;
        }
    }

    final void a(boolean bl) {
        if (this.b.K == 12) {
            return;
        }
        if (!this.d) {
            this.c = (byte)-1;
            if (this.b.X < 1) {
                this.b.X = (byte)2;
            }
            if (!bl) {
                return;
            }
            if (this.b.K > 5 && this.b.K < 11) {
                this.b.K = (byte)5;
                return;
            }
            switch (this.b.K) {
                case 0: {
                    this.b.j = !this.b.j;
                    break;
                }
                case 1: {
                    this.b.X = 0;
                    e.J = !e.J;
                    this.b.d = !this.b.d;
                    break;
                }
                case 2: {
                    this.b.K = (byte)3;
                    break;
                }
                case 3: {
                    this.b.j = !this.b.j;
                    break;
                }
                case 5: {
                    this.b.K = (byte)3;
                    break;
                }
                case 11: {
                    this.b.K = (byte)3;
                    break;
                }
                case 12: {
                    this.b.K = (byte)3;
                    break;
                }
                case 14: {
                    this.b.K = (byte)3;
                    break;
                }
                case 20: {
                    this.b.K = 1;
                    break;
                }
                case 22: {
                    this.b.K = (byte)3;
                    this.b.Q = true;
                    this.b.A = true;
                }
            }
            if (this.b.K == 19) {
                this.b.q = null;
                this.b.r = null;
                this.b.K = (byte)13;
            }
            if (this.b.K == 4) {
                this.b.q = null;
                this.b.r = null;
                this.b.K = (byte)3;
            }
            if (this.b.K == 13) {
                this.b.K = (byte)(6 + this.b.t);
            }
        }
    }

    private void a(Graphics graphics, String string) {
        int n = this.m >> 1;
        int n2 = this.S + this.P;
        graphics.setColor(0xFF0000);
        graphics.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, n - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
        graphics.setClip(this.R, n - this.n, this.P, this.m);
        graphics.drawImage(this.b.k, this.R - this.P, n - this.n, 20);
        graphics.setClip(this.S, n - this.n, this.P, this.m);
        graphics.drawImage(this.b.k, this.S, n - this.n, 20);
        graphics.setClip(0, 0, this.b.e, this.b.b);
        this.k.a(graphics, string, this.Q - (this.k.a(string) >> 1), n - (this.M >> 1) - 1, 20);
        graphics.setColor(0);
        graphics.drawLine(n2, n - this.n + 4, this.R, n - this.n + 4);
        graphics.drawLine(n2, n + this.n - 4, this.R, n + this.n - 4);
        graphics.drawLine(n2, n + this.n - 2, this.R, n + this.n - 2);
        graphics.drawLine(n2, n - this.n + 2, this.R, n - this.n + 2);
        graphics.setColor(0xBBB800);
        graphics.drawLine(n2, n + this.n - 3, this.R, n + this.n - 3);
        graphics.drawLine(n2, n - this.n + 3, this.R, n - this.n + 3);
    }

    private void a(Graphics graphics) {
        int n = 32;
        if (this.c == -2) {
            n = 34;
        }
        this.b.a(graphics, n, 0, this.b.b - this.b.h[3][32]);
        n = 33;
        if (this.c == -1) {
            n = 35;
        }
        this.b.a(graphics, n, this.b.e - this.b.h[2][33], this.b.b - this.b.h[3][33]);
        if (this.b.X == 2) {
            this.b.X = 1;
            return;
        }
        if (this.b.X == 1) {
            this.b.X = 0;
            if (this.c == -1) {
                this.a(true);
            } else {
                this.b(true);
            }
        }
        this.c = 0;
    }

    /*
     * Handled duff style switch with additional control
     * Enabled aggressive block sorting
     */
    final void b(boolean bl) {
        if (this.d) return;
        this.c = (byte)-2;
        if (!bl) {
            if (this.b.X >= 1) return;
            this.b.X = (byte)2;
            return;
        }
        if (this.b.K > 5 && this.b.K < 11) {
            this.b.K = (byte)13;
            if (this.b.t == 3) {
                this.b.N = (byte)4;
                return;
            }
            this.b.N = (byte)10;
            return;
        }
        int n = Integer.MIN_VALUE;
        block60: do {
            switch (n == Integer.MIN_VALUE ? this.b.K : n) {
                case 0: {
                    switch (this.a) {
                        case 0: {
                            this.b.K = (byte)3;
                            e.c();
                            e.V = true;
                            return;
                        }
                        case 1: {
                            this.b.K = (byte)3;
                            e.f();
                            e.V = false;
                            return;
                        }
                    }
                    return;
                }
                case 1: {
                    switch (this.a) {
                        case 0: {
                            e.J = !e.J;
                            this.b.d = !this.b.d;
                            return;
                        }
                        case 1: {
                            this.b.e();
                            this.b.K = (byte)20;
                            return;
                        }
                        case 2: {
                            this.b.d();
                            e.J = !e.J;
                            this.b.d = !this.b.d;
                            return;
                        }
                        case 3: {
                            e.V = !e.V;
                            this.b.A = true;
                            this.b.z = true;
                            return;
                        }
                        case 4: {
                            e.n = (byte)(e.n + 1);
                            if (e.n > e.o) {
                                e.n = 0;
                            }
                            this.b.R = true;
                            e.J = !e.J;
                            this.b.K = 1;
                            this.b.A = true;
                            this.b.a(this.b.L ? 1 : 2);
                            this.b.C = this.b.e / this.b.w.getWidth() + 1;
                            this.b.S = false;
                            this.b.aa = 0;
                            return;
                        }
                        case 5: {
                            this.b.K = (byte)3;
                            this.b.Q = true;
                            this.b.A = true;
                            return;
                        }
                        case 6: {
                            this.b.j = !this.b.j;
                            return;
                        }
                    }
                    return;
                }
                case 2: {
                    switch (this.a) {
                        case 0: {
                            e.ac = !e.ac;
                            return;
                        }
                        case 1: {
                            e.V = !e.V;
                            this.b.A = true;
                            this.b.z = true;
                            return;
                        }
                        case 2: {
                            this.b.K = (byte)3;
                            return;
                        }
                    }
                    return;
                }
                case 3: {
                    switch (this.a) {
                        case 0: {
                            this.b.a = false;
                            this.b.K = (byte)5;
                            return;
                        }
                        case 1: {
                            this.b.K = (byte)2;
                            return;
                        }
                        case 2: {
                            this.b.K = (byte)11;
                            return;
                        }
                        case 3: {
                            this.b.K = (byte)12;
                            this.b.i = "";
                            return;
                        }
                        case 4: {
                            this.b.j = !this.b.j;
                            return;
                        }
                    }
                    return;
                }
                case 4: {
                    switch (this.a) {
                        case 0: {
                            e.J = !e.J;
                            this.b.K = 1;
                            this.b.A = true;
                            this.b.L = true;
                            this.b.q = null;
                            this.b.r = null;
                            this.b.a(1);
                            return;
                        }
                        case 1: {
                            e.J = !e.J;
                            this.b.K = 1;
                            this.b.A = true;
                            this.b.L = false;
                            this.b.q = null;
                            this.b.r = null;
                            this.b.a(2);
                            return;
                        }
                        case 2: {
                            this.b.q = null;
                            this.b.r = null;
                            this.b.K = (byte)3;
                            return;
                        }
                    }
                    return;
                }
                case 5: {
                    this.b.g[0] = this.b.I >> 1;
                    this.b.g[1] = this.b.I >> 1;
                    switch (this.a) {
                        case 0: {
                            this.b.K = (byte)6;
                            this.b.t = this.a;
                            this.b.t = 0;
                            return;
                        }
                        case 1: {
                            this.b.K = (byte)7;
                            this.b.t = this.a;
                            this.b.t = 1;
                            return;
                        }
                        case 2: {
                            this.b.K = (byte)8;
                            this.b.t = this.a;
                            this.b.t = 2;
                            return;
                        }
                        case 3: {
                            this.b.K = (byte)9;
                            this.b.t = this.a;
                            this.b.t = 3;
                            return;
                        }
                        case 4: {
                            this.b.K = (byte)10;
                            this.b.t = this.a;
                            this.b.t = 4;
                            return;
                        }
                        case 5: {
                            this.b.K = (byte)3;
                            return;
                        }
                    }
                    return;
                }
                case 11: {
                    this.b.K = (byte)3;
                    return;
                }
                case 12: {
                    this.b.K = (byte)3;
                    return;
                }
                case 13: {
                    if (this.a == this.z - 1) {
                        this.b.K = (byte)(6 + this.b.t);
                        return;
                    }
                    this.b.T = this.a;
                    this.b.K = (byte)19;
                    this.b.b();
                    this.b.C = this.b.e / this.b.w.getWidth() + 1;
                    return;
                }
                case 14: {
                    n = 25;
                    if (this.a == this.z - 1) continue block60;
                    this.b.T = this.a;
                    this.b.K = (byte)4;
                    this.b.b();
                    this.b.C = this.b.e / this.b.w.getWidth() + 1;
                    return;
                }
                case 19: {
                    switch (this.a) {
                        case 0: {
                            e.J = !e.J;
                            this.b.K = 1;
                            this.b.A = true;
                            this.b.L = true;
                            this.b.q = null;
                            this.b.r = null;
                            this.b.a(1);
                            return;
                        }
                        case 1: {
                            e.J = !e.J;
                            this.b.K = 1;
                            this.b.A = true;
                            this.b.L = false;
                            this.b.q = null;
                            this.b.r = null;
                            this.b.a(2);
                            return;
                        }
                        case 2: {
                            this.b.q = null;
                            this.b.r = null;
                            this.b.K = (byte)3;
                            return;
                        }
                    }
                    return;
                }
                case 20: {
                    this.b.K = 1;
                    return;
                }
                case 21: {
                    this.b.K = (byte)3;
                    this.b.Q = true;
                    this.b.A = true;
                    return;
                }
                case 22: {
                    this.b.K = (byte)(6 + this.b.t);
                    this.b.Q = true;
                    this.b.A = true;
                    return;
                }
                case 25: {
                    this.b.K = (byte)3;
                    return;
                }
            }
            return;
        } while (true);
    }

    private void a(Graphics graphics, byte by, byte by2) {
        if (this.E) {
            int n;
            int n2;
            if (by2 == 5) {
                by = (byte)(by + 7);
                n2 = this.r;
                n = this.h + this.L * (this.x - 1) + this.L + (this.b.p.getWidth() >> 1) + 3;
            } else {
                n2 = this.r;
                n = this.h + this.q + (this.b.w.getHeight() >> 2) + 3;
            }
            graphics.setColor(8931840);
            graphics.drawRect(this.O - 1, n - 2, this.b.e - (this.O << 1) + 1, n2 - 2);
            graphics.setColor(1516032);
            graphics.fillRect(this.O, n + 1 - 2, this.b.e - (this.O << 1), n2 - 1 - 2);
            n2 = this.D;
            if (n2 > this.v) {
                n2 = this.v;
            }
            if (this.D != this.N[by].length) {
                this.k.a(graphics, this.N[by][this.D], 0, this.C, (this.O << 1) - (this.O >> 1), this.i + 3 + n2 * this.M, 20);
                this.k.a(graphics, this.I, (this.O << 1) - (this.O >> 1) + this.k.a(this.N[by][this.D], 0, this.C), this.i + 3 + n2 * this.M, 20);
            } else if (by2 == 5) {
                ++n2;
            }
            by2 = (byte)this.s;
            while (by2 < n2 + this.s) {
                this.k.a(graphics, this.N[by][by2], (this.O << 1) - (this.O >> 1), this.i + 3 + (by2 - this.s) * this.M, 20);
                by2 = (byte)(by2 + 1);
            }
            this.I = "_";
            --this.g;
            if (this.g == 0) {
                if (this.D == this.N[by].length) {
                    this.s = 0;
                    this.D = 0;
                }
                this.g = this.K;
                ++this.C;
                if (this.C == this.N[by][this.D].length()) {
                    this.I = "";
                    this.C = 0;
                    ++this.D;
                    this.g = this.K << 3;
                    if (this.D == this.N[by].length) {
                        this.g = this.K << 6;
                        return;
                    }
                    if (n2 == this.v) {
                        ++this.s;
                    }
                }
            }
        }
    }

    final void a() {
        if (!this.d) {
            this.A = true;
            if (this.b.K != 11 && this.b.K != 12 && this.b.K != 20 && this.b.K != 22) {
                ++this.a;
                if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
                    this.s = 0;
                    this.D = 0;
                    this.g = this.K;
                    this.C = 0;
                }
                if (this.a == this.z) {
                    this.a = 0;
                    this.G = 0;
                }
                if (this.a > this.x + this.G - 1) {
                    ++this.G;
                }
                if ((this.b.K == 13 || this.b.K == 14) && this.a > this.b.N) {
                    this.a = this.b.y;
                    this.G = this.z - this.x;
                }
                return;
            }
            if (this.x + this.G < this.z) {
                ++this.G;
            }
        }
    }

    final void b() {
        if (!this.d) {
            this.A = true;
            if (this.b.K != 11 && this.b.K != 12 && this.b.K != 20 && this.b.K != 22) {
                --this.a;
                if (this.b.K == 5 || this.b.K == 6 || this.b.K == 7 || this.b.K == 8 || this.b.K == 9 || this.b.K == 10) {
                    this.s = 0;
                    this.D = 0;
                    this.g = this.K;
                    this.C = 0;
                }
                if (this.a < 0) {
                    this.a = this.z - 1;
                    this.G = this.z - this.x;
                    return;
                }
                if ((this.b.K == 13 || this.b.K == 14) && this.a > this.b.N) {
                    this.a = this.b.N;
                    this.G = this.a - this.x + 1 > 0 ? this.a - this.x + 1 : 0;
                    return;
                }
                if (this.a < this.G) {
                    --this.G;
                }
                return;
            }
            if (this.G > 0) {
                --this.G;
            }
        }
    }

    private void a(Graphics graphics, int n) {
        int n2 = (this.b.b >> 2) - (this.w >> 1) + (this.b.q.getHeight() >> 3);
        int n3 = (this.b.e >> 2) - (this.b.q.getWidth() >> 1);
        int n4 = this.b.e - (this.b.e >> 2) - (this.b.q.getWidth() >> 1);
        int n5 = n3;
        graphics.setColor(1450496);
        graphics.setClip(0, (this.b.c >> 1) - n, this.b.e, n << 1);
        graphics.fillRect(0, (this.b.c >> 1) - n, this.b.e, n << 1);
        if (this.a == 1) {
            n5 = n4;
        }
        graphics.setColor(4478976);
        graphics.fillRect(n5 - 9, n2 - 4, this.b.q.getWidth() + 18, this.b.q.getHeight() + 8);
        graphics.setColor(5599744);
        graphics.fillRect(n5 - 3, n2 - 3, this.b.q.getWidth() + 6, this.b.q.getHeight() + 6);
        graphics.setColor(9807360);
        if (this.a == 1) {
            graphics.setColor(15857920);
        }
        graphics.drawRect(n4 - 1, n2 - 1, this.b.r.getWidth() + 1, this.b.r.getHeight() + 1);
        graphics.setColor(7702016);
        if (this.a == 0) {
            graphics.setColor(15857920);
        }
        graphics.drawRect(n3 - 1, n2 - 1, this.b.q.getWidth() + 1, this.b.q.getHeight() + 1);
        graphics.drawImage(this.b.q, n3, n2, 20);
        graphics.drawImage(this.b.r, n4, n2, 20);
    }

    private void a(Graphics graphics, int n, int n2, int n3) {
        n = 0;
        n = n2 + n3;
        graphics.setClip(0, n, this.b.e, this.b.w.getHeight() >> 2);
        n -= this.b.w.getHeight() - (this.b.w.getHeight() >> 2);
        int n4 = 0;
        while (n4 < this.b.C) {
            graphics.drawImage(this.b.w, n4 * this.b.w.getWidth(), n + 1, 20);
            ++n4;
        }
        n = n2 - (this.b.w.getHeight() >> 2) - n3;
        graphics.setClip(0, n, this.b.e, this.b.w.getHeight() >> 2);
        n -= this.b.w.getHeight() >> 1;
        n2 = 0;
        while (n2 < this.b.C) {
            graphics.drawImage(this.b.w, n2 * this.b.w.getWidth(), n, 20);
            ++n2;
        }
        graphics.setClip(0, 0, this.b.e, this.b.b);
    }

    final void a(Graphics graphics, byte by) {
        graphics.setColor(0);
        if (by != 21 && by != 1) {
            graphics.fillRect(0, 0, this.b.e, this.b.b);
        }
        if (by == 21 && this.b.B != null) {
            graphics.setColor(0);
            graphics.fillRect(0, 0, this.b.e, this.b.b);
            graphics.setColor(0xFFFFFF);
            graphics.drawImage(this.b.B, (this.b.e >> 1) - (this.b.B.getWidth() >> 1), (this.b.b >> 1) - (this.b.B.getHeight() >> 1), 20);
            this.b.B = null;
        }
        if (by == 11 || by == 12) {
            graphics.setColor(1516544);
            graphics.fillRect(0, 0, this.b.e, this.l);
            graphics.fillRect(0, this.b.b - this.l, this.b.e, this.l);
            graphics.setColor(2967296);
            graphics.drawRect(0, 0, this.b.e - 1, this.l);
            graphics.drawRect(0, this.b.b - this.l, this.b.e - 1, this.l - 1);
            graphics.setColor(12301068);
            graphics.drawRect(0, this.l, this.b.e - this.O, this.b.b - (this.l << 1));
            this.H = this.x >= this.z ? this.u : this.x * this.u / (this.z - this.x);
            this.H = 6;
            this.F = this.x != this.z ? this.G * (this.u - this.H) / (this.z - this.x) + this.l : this.l;
            if (this.F > this.b.b - this.l - this.H) {
                this.F = this.b.b - this.l - this.H;
            }
            if (this.z > this.x) {
                graphics.drawRect(this.b.e - this.O, this.F, this.O - 1, this.H);
                graphics.setColor(0);
                graphics.drawRect(this.b.e - this.O, this.F + 1, this.O - 2, this.H - 2);
                if (this.A) {
                    graphics.setColor(0xCD0000);
                    this.A = false;
                } else {
                    graphics.setColor(2967296);
                }
                graphics.drawRect(this.b.e - this.O, this.F + 2, this.O - 3, this.H - 4);
            }
            this.k.a(graphics, this.B[0], this.Q - (this.b.s.a(this.B[0]) >> 1), (this.l >> 1) - (this.M >> 1), 20);
            int n = this.G;
            while (n < this.x + this.G) {
                if (this.B[n] != null && this.B[n].length() > 0 && n != 0) {
                    if (this.B[n].charAt(0) == '|') {
                        this.k.a(graphics, this.B[n].substring(1, this.B[n].length()), this.Q - (this.b.s.a(this.B[n]) >> 1), this.j + this.L * (n - this.G), 20);
                    } else {
                        this.k.a(graphics, this.B[n], this.O, this.j + this.L * (n - this.G), 20);
                    }
                }
                ++n;
            }
            this.a(graphics);
            return;
        }
        if (this.d) {
            int n;
            int n2;
            this.e += this.J;
            if (by != 4 && by != 6 && by != 7 && by != 8 && by != 9 && by != 10 && by != 19 && this.Q + this.e > this.R) {
                this.e = -this.J;
                this.f = (byte)(this.f + 1);
                if (this.f == this.x) {
                    boolean bl = this.d = !this.d;
                    if (by == 5) {
                        this.b.W = 35;
                    }
                }
            } else {
                n2 = this.h + (this.f - this.G) * this.L + (this.L >> 1);
                if (by == 4 || by == 19) {
                    if (this.J + this.e > this.w) {
                        this.d = !this.d;
                    }
                    this.a(graphics, this.e >> 1);
                    this.a(graphics, 0, this.b.b >> 2, this.e >> 1);
                    return;
                }
                if (by == 6 || by == 7 || by == 8 || by == 9 || by == 10) {
                    if (this.J + this.e > this.w) {
                        this.d = !this.d;
                        this.b.W = 35;
                    }
                    graphics.setColor(1516032);
                    graphics.fillRect(0, this.y - (this.e >> 1), this.b.e, this.e);
                    int n3 = 0;
                    while (n3 < this.x) {
                        graphics.setClip(0, this.y - (this.e >> 1), this.b.e, this.e);
                        graphics.setColor(2967296);
                        graphics.fillRect(2, this.h + n3 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                        ++n3;
                    }
                    graphics.setColor(0);
                    graphics.fillRect(0, 0, this.b.e, this.y - (this.e >> 1));
                    graphics.fillRect(0, this.y + (this.e >> 1), this.b.e, this.b.b - this.y - (this.e >> 1));
                    this.a(graphics, 0, this.y, this.e >> 1);
                    return;
                }
                n = this.Q - this.e;
                graphics.setColor(2967296);
                graphics.fillRect(this.Q - this.e - this.P + 1, n2 - (this.m - 4 >> 1), (this.e + this.P << 1) - 2, this.m - 4);
                graphics.setClip(this.Q - this.e - this.P, n2 - this.n, this.P, this.m);
                graphics.drawImage(this.b.k, this.Q - this.e - this.P, n2 - this.n, 20);
                graphics.setClip(this.Q + this.e, n2 - this.n, this.P, this.m);
                graphics.drawImage(this.b.k, this.Q + this.e - this.P, n2 - this.n, 20);
                graphics.setClip(0, 0, this.b.e, this.b.b);
                graphics.setColor(0);
                graphics.drawLine(n, n2 - this.n + 4, this.Q + this.e, n2 - this.n + 4);
                graphics.drawLine(n, n2 + this.n - 4, this.Q + this.e, n2 + this.n - 4);
                graphics.drawLine(n, n2 + this.n - 2, this.Q + this.e, n2 + this.n - 2);
                graphics.drawLine(n, n2 - this.n + 2, this.Q + this.e, n2 - this.n + 2);
                graphics.setColor(0xBBB800);
                graphics.drawLine(n, n2 + this.n - 3, this.Q + this.e, n2 + this.n - 3);
                graphics.drawLine(n, n2 - this.n + 3, this.Q + this.e, n2 - this.n + 3);
            }
            int n4 = 0;
            while (n4 < this.f) {
                n2 = this.h + (n4 - this.G) * this.L + (this.L >> 1);
                if (by == 4 || by == 19) {
                    n2 = (this.b.b >> 1) - (this.L >> 1) + (this.b.b >> 2);
                    this.a(graphics, this.e >> 1);
                    this.a(graphics, 0, this.b.b >> 2, this.e >> 1);
                }
                n = this.S + this.P;
                graphics.setColor(2967296);
                graphics.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, n2 - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
                graphics.setClip(this.R, n2 - this.n, this.P, this.m);
                graphics.drawImage(this.b.k, this.R - this.P, n2 - this.n, 20);
                graphics.setClip(this.S, n2 - this.n, this.P, this.m);
                graphics.drawImage(this.b.k, this.S, n2 - this.n, 20);
                graphics.setClip(0, 0, this.b.e, this.b.b);
                graphics.setColor(0);
                graphics.drawLine(n, n2 - this.n + 4, this.R, n2 - this.n + 4);
                graphics.drawLine(n, n2 + this.n - 4, this.R, n2 + this.n - 4);
                graphics.drawLine(n, n2 + this.n - 2, this.R, n2 + this.n - 2);
                graphics.drawLine(n, n2 - this.n + 2, this.R, n2 - this.n + 2);
                graphics.setColor(0xBBB800);
                graphics.drawLine(n, n2 + this.n - 3, this.R, n2 + this.n - 3);
                graphics.drawLine(n, n2 - this.n + 3, this.R, n2 - this.n + 3);
                this.k.a(graphics, this.B[n4], this.Q - (this.k.a(this.B[n4]) >> 1), n2 - (this.M >> 1) - 1, 20);
                ++n4;
            }
            return;
        }
        if (by == 20 || by == 22) {
            graphics.setColor(0);
            graphics.fillRect(0, 0, this.b.e, this.b.b);
            graphics.setColor(0xFFFFFF);
            this.H = 6;
            if (this.z - this.x > 0) {
                this.F = this.G * (this.q - this.H) / (this.z - this.x) + this.h;
            }
            this.b.a(graphics, 30, this.b.e - this.O - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] >> 1) - 1, 0);
            this.b.a(graphics, 27, this.b.e - this.O - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][27] + 5) - 1, 0);
            int n = this.G;
            while (n < this.x + this.G) {
                byte by2 = 0;
                byte by3 = 0;
                if (this.b.L) {
                    by2 = this.b.h[2][19];
                    by3 = this.b.h[3][19];
                } else {
                    by2 = this.b.h[2][20];
                    by3 = this.b.h[3][20];
                }
                if (this.b.ab[this.b.U[n]][20] == 0) {
                    graphics.setColor(11800593);
                } else {
                    graphics.setColor(4351744);
                }
                graphics.fillRect(this.O, this.h + (n - this.G) * this.L, this.b.e - (this.O << 1), this.L);
                if (this.b.ab[this.b.U[n]][20] == 0) {
                    graphics.setColor(0x5E0000);
                } else {
                    graphics.setColor(1516032);
                }
                graphics.fillRect(this.O + 2, this.h + (n - this.G) * this.L - (this.b.h[3][20] >> 1) + (this.L >> 1), this.b.e - (this.O << 1) - 4, (int)this.b.h[3][20]);
                if (this.b.ab[this.b.U[n]][20] == 0) {
                    graphics.setColor(11800593);
                } else {
                    graphics.setColor(4351744);
                }
                graphics.drawLine(this.b.e - this.O - (this.b.h[2][27] + 5), this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1, this.b.e - this.O - (this.b.h[2][27] + 5), this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1 + this.b.h[3][20]);
                graphics.drawLine(this.b.e - this.O - (this.b.h[2][27] + 5 << 1), this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1, this.b.e - this.O - (this.b.h[2][27] + 5 << 1), this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1 + this.b.h[3][20]);
                if (this.b.U[n] == this.b.Y) {
                    if (this.b.L) {
                        graphics.setColor(11800593);
                    } else {
                        graphics.setColor(4351744);
                    }
                    graphics.fillRect((this.O << 1) - 1, this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1, by2 + 1, by3 + 1);
                    if (this.b.L) {
                        graphics.setColor(0x5E0000);
                    } else {
                        graphics.setColor(1516032);
                    }
                    graphics.drawRect((this.O << 1) - 1, this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1) - 1, by2 + 1, by3 + 1);
                }
                this.b.a(graphics, 20 - this.b.ab[this.b.U[n]][20] / 110, this.O << 1, this.h + (n - this.G) * this.L + (this.L >> 1) - (by3 >> 1));
                this.k.a(graphics, this.b.O[(this.b.U[n] << 1) + 1] + "", this.b.e - this.O - (this.k.a(this.b.O[(this.b.U[n] << 1) + 1] + "") >> 1) - (this.b.h[2][27] + 5 >> 1), this.h + (n - this.G) * this.L + (this.L >> 1) - (this.M >> 1), 20);
                this.k.a(graphics, this.b.O[this.b.U[n] << 1] + "", this.b.e - this.O - (this.k.a(this.b.O[this.b.U[n] << 1] + "") >> 1) - (this.b.h[2][27] + 5 >> 1) - (this.b.h[2][27] + 5), this.h + (n - this.G) * this.L + (this.L >> 1) - (this.M >> 1), 20);
                ++n;
            }
            graphics.setColor(12367873);
            graphics.drawRect(this.O, this.h, this.b.e - (this.O << 1), this.q);
            if (this.z - this.x > 0) {
                graphics.drawRect(this.b.e - this.O, this.F, this.O - 1, this.H);
                graphics.setColor(0);
                graphics.drawRect(this.b.e - this.O, this.F + 1, this.O - 2, this.H - 2);
                graphics.setColor(0xFF0000);
                graphics.drawRect(this.b.e - this.O, this.F + 2, this.O - 3, this.H - 4);
            }
            this.a(graphics);
            return;
        }
        if (this.B == null) {
            return;
        }
        if (by == 6 || by == 7) {
            int n;
            int n5 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
            this.a(graphics, 0, this.y, this.w >> 1);
            graphics.setColor(1516032);
            graphics.fillRect(0, this.h, this.b.e, this.q + 1);
            int n6 = 0;
            while (n6 < this.x) {
                n = this.h + n6 * this.L + (this.L >> 1);
                if (this.a != n6) {
                    graphics.setColor(2967296);
                    graphics.fillRect(2, this.h + n6 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                    graphics.setColor(2967296);
                    graphics.drawRect(this.b.e - n5 - 1, n - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                    this.b.a(graphics, n6 + 27, this.b.e - n5, n - (this.b.h[3][27] >> 1));
                    if (n6 == 3) {
                        this.b.a(graphics, 40, this.b.e - n5, n - (this.b.h[3][27] >> 1));
                    }
                    this.k.a(graphics, this.B[n6], this.O, n - (this.M >> 1), 20);
                    switch (n6) {
                        case 0: {
                            this.k.a(graphics, "" + this.b.F, this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.F) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2), n - (this.M >> 1), 20);
                            break;
                        }
                        case 1: {
                            this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2), n - (this.M >> 1), 20);
                            break;
                        }
                        case 2: {
                            this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38] - (this.b.h[2][27] >> 2), n - (this.M >> 1), 20);
                            break;
                        }
                        case 3: {
                            this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], n - (this.M >> 1), 20);
                        }
                    }
                }
                ++n6;
            }
            graphics.setColor(4286208);
            graphics.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
            graphics.setColor(12171264);
            graphics.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
            graphics.drawRect(this.b.e - n5 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
            this.b.a(graphics, this.a == 3 ? 40 : 27 + this.a, this.b.e - n5, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            n = 38;
            if (this.c == 2) {
                n = 37;
            }
            this.b.a(graphics, n, this.b.e - n5 - this.b.h[2][38] - (this.b.h[2][38] >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1));
            n = 36;
            if (this.c == 1) {
                n = 39;
            }
            this.b.a(graphics, n, this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1));
            this.k.a(graphics, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
            switch (this.a) {
                case 0: {
                    this.k.a(graphics, "" + this.b.F, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.F) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 1: {
                    this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 2: {
                    this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 3: {
                    this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                }
            }
            this.a(graphics, (byte)this.a, by);
            this.a(graphics);
            if (this.E) {
                this.a(graphics, this.B[this.z]);
            }
            return;
        }
        if (by == 8) {
            int n;
            int n7 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
            this.a(graphics, 0, this.y, this.w >> 1);
            graphics.setColor(1516032);
            graphics.fillRect(0, this.h, this.b.e, this.q);
            int n8 = 0;
            while (n8 < this.x) {
                n = this.h + n8 * this.L + (this.L >> 1);
                if (this.a != n8) {
                    graphics.setColor(2967296);
                    graphics.fillRect(2, this.h + n8 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                    graphics.setColor(2967296);
                    graphics.drawRect(this.b.e - n7 - 1, n - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                    this.b.a(graphics, n8 == 0 ? 30 : n8 + 27, this.b.e - n7, n - (this.b.h[3][27] >> 1));
                    if (n8 == 3) {
                        this.b.a(graphics, 40, this.b.e - n7, n - (this.b.h[3][27] >> 1));
                    }
                    this.k.a(graphics, this.B[n8], this.O, this.h + n8 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    switch (n8) {
                        case 0: {
                            this.k.a(graphics, "" + this.b.D, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.D) >> 1) - this.b.h[2][38], this.h + n8 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 1: {
                            this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + n8 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 2: {
                            this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 1) - (this.b.h[2][27] >> 2) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + n8 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 3: {
                            this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + n8 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                        }
                    }
                }
                ++n8;
            }
            graphics.setColor(4286208);
            graphics.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
            graphics.setColor(12171264);
            graphics.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
            graphics.drawRect(this.b.e - n7 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
            this.b.a(graphics, this.a == 0 ? 30 : 27 + this.a, this.b.e - n7, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            if (this.a == 3) {
                this.b.a(graphics, 40, this.b.e - n7, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            }
            n = 38;
            if (this.c == 2) {
                n = 37;
            }
            this.b.a(graphics, n, this.b.e - n7 - this.b.h[2][38] - (this.b.h[2][38] >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1));
            n = 36;
            if (this.c == 1) {
                n = 39;
            }
            this.b.a(graphics, n, this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1));
            this.k.a(graphics, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
            switch (this.a) {
                case 0: {
                    this.k.a(graphics, "" + this.b.D, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.D) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 1: {
                    this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 2: {
                    this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 3: {
                    this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                }
            }
            this.a(graphics, (byte)(this.a == 0 ? 5 : this.a), by);
            this.a(graphics);
            if (this.E) {
                this.a(graphics, this.B[this.z]);
            }
            return;
        }
        if (by == 9) {
            int n;
            int n9 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
            this.a(graphics, 0, this.y, this.w >> 1);
            graphics.setColor(1516032);
            graphics.fillRect(0, this.h, this.b.e, this.q);
            int n10 = 0;
            while (n10 < this.x) {
                n = this.h + n10 * this.L + (this.L >> 1);
                if (this.a != n10) {
                    graphics.setColor(2967296);
                    graphics.fillRect(2, this.h + n10 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                    graphics.setColor(2967296);
                    graphics.drawRect(this.b.e - n9 - 1, n - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                    this.b.a(graphics, n10 == 0 ? 31 : n10 + 27, this.b.e - n9, n - (this.b.h[3][27] >> 1));
                    if (n10 == 3) {
                        this.b.a(graphics, 40, this.b.e - n9, n - (this.b.h[3][27] >> 1));
                    }
                    this.k.a(graphics, this.B[n10], this.O, this.h + n10 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    switch (n10) {
                        case 0: {
                            this.k.a(graphics, "" + this.b.E, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.E) >> 1) - this.b.h[2][38], this.h + n10 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 1: {
                            this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + n10 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 2: {
                            this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + n10 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 3: {
                            this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + n10 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                        }
                    }
                }
                ++n10;
            }
            graphics.setColor(4286208);
            graphics.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
            graphics.setColor(12171264);
            graphics.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
            graphics.drawRect(this.b.e - n9 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
            this.b.a(graphics, this.a == 0 ? 31 : 27 + this.a, this.b.e - n9, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            if (this.a == 3) {
                this.b.a(graphics, 40, this.b.e - n9, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            }
            n = 38;
            if (this.c == 2) {
                n = 37;
            }
            this.b.a(graphics, n, this.b.e - n9 - this.b.h[2][38] - (this.b.h[2][38] >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1));
            n = 36;
            if (this.c == 1) {
                n = 39;
            }
            this.b.a(graphics, n, this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][27] >> 1) - (this.b.h[2][38] << 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1));
            this.k.a(graphics, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
            switch (this.a) {
                case 0: {
                    this.k.a(graphics, "" + this.b.E, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.E) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 1: {
                    this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 2: {
                    this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 3: {
                    this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                }
            }
            this.a(graphics, (byte)(this.a == 0 ? 4 : this.a), by);
            this.a(graphics);
            if (this.E) {
                this.a(graphics, this.B[this.z]);
            }
            return;
        }
        if (by == 10) {
            int n;
            int n11 = (this.b.h[2][27] << 1) + (this.b.h[2][27] >> 1) + (this.b.h[2][38] << 1);
            this.a(graphics, 0, this.y, this.w >> 1);
            graphics.setColor(1516032);
            graphics.fillRect(0, this.h, this.b.e, this.q);
            int n12 = 0;
            while (n12 < this.x) {
                n = this.h + n12 * this.L + (this.L >> 1);
                if (this.a != n12) {
                    graphics.setColor(2967296);
                    graphics.fillRect(2, this.h + n12 * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
                    graphics.setColor(2967296);
                    graphics.drawRect(this.b.e - n11 - 1, n - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
                    this.b.a(graphics, n12 == 3 ? 40 : n12 + 27, this.b.e - n11, n - (this.b.h[3][27] >> 1));
                    this.k.a(graphics, this.B[n12], this.O, this.h + n12 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    switch (n12) {
                        case 0: {
                            this.k.a(graphics, "" + this.b.G, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.G) >> 1) - this.b.h[2][38], this.h + n12 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 1: {
                            this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + n12 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 2: {
                            this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + n12 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                            break;
                        }
                        case 3: {
                            this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + n12 * this.L + (this.L >> 1) - (this.M >> 1), 20);
                        }
                    }
                }
                ++n12;
            }
            graphics.setColor(4286208);
            graphics.fillRect(2, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1), this.b.e - 4, this.b.h[3][27] - 4);
            graphics.setColor(12171264);
            graphics.drawRect(1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] - 4 >> 1) - 1, this.b.e - 3, this.b.h[3][27] - 3);
            graphics.drawRect(this.b.e - n11 - 1, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1) - 1, this.b.h[2][27] + 1, this.b.h[3][27] + 1);
            this.b.a(graphics, this.a == 3 ? 40 : 27 + this.a, this.b.e - n11, this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][27] >> 1));
            n = 38;
            if (this.c == 2) {
                n = 37;
            }
            this.b.a(graphics, n, this.b.e - n11 - this.b.h[2][38] - (this.b.h[2][38] >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][38] >> 1));
            n = 36;
            if (this.c == 1) {
                n = 39;
            }
            this.b.a(graphics, n, this.b.e - this.b.h[2][27] + (this.b.h[2][38] >> 1) - (this.b.h[2][38] << 1) - (this.b.h[2][27] >> 1), this.h + this.a * this.L + (this.L >> 1) - (this.b.h[3][36] >> 1));
            this.k.a(graphics, this.B[this.a], this.O, this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
            switch (this.a) {
                case 0: {
                    this.k.a(graphics, "" + this.b.G, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.G) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 1: {
                    this.k.a(graphics, "" + this.b.H, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.H) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 2: {
                    this.k.a(graphics, "" + this.b.I, this.b.e - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a("" + this.b.I) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                    break;
                }
                case 3: {
                    this.k.a(graphics, this.b.g[0] + ":" + this.b.g[1], this.b.e + (this.b.g[1] == this.b.g[0] ? 1 : 0) - (this.b.h[2][27] >> 2) - (this.b.h[2][27] >> 1) - (this.k.a(this.b.g[0] + ":" + this.b.g[1]) >> 1) - this.b.h[2][38], this.h + this.a * this.L + (this.L >> 1) - (this.M >> 1), 20);
                }
            }
            this.a(graphics, (byte)(this.a == 0 ? 6 : this.a), by);
            this.a(graphics);
            if (this.E) {
                this.a(graphics, this.B[this.z]);
            }
            return;
        }
        if (by == 4 || by == 19) {
            int n = (this.b.b >> 1) - (this.L >> 1) + (this.b.b >> 2);
            int n13 = this.S + this.P;
            if (this.a == 0) {
                graphics.setColor(0xFF0000);
            } else {
                graphics.setColor(255);
            }
            boolean bl = false;
            boolean bl2 = false;
            graphics.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5, n - (this.m - 4 >> 1), this.R - this.S + this.P - 10, this.m - 4);
            graphics.setClip(this.R, n - this.n, this.P, this.m);
            graphics.drawImage(this.b.k, this.R - this.P, n - this.n, 20);
            graphics.setClip(this.S, n - this.n, this.P, this.m);
            graphics.drawImage(this.b.k, this.S, n - this.n, 20);
            graphics.setClip(0, 0, this.b.e, this.b.b);
            this.k.a(graphics, this.B[this.a], this.Q - (this.k.a(this.B[this.a]) >> 1), n - (this.M >> 1) - 1, 20);
            graphics.setColor(0);
            graphics.drawLine(n13, n - this.n + 4, this.R, n - this.n + 4);
            graphics.drawLine(n13, n + this.n - 4, this.R, n + this.n - 4);
            graphics.drawLine(n13, n + this.n - 2, this.R, n + this.n - 2);
            graphics.drawLine(n13, n - this.n + 2, this.R, n - this.n + 2);
            graphics.setColor(0xBBB800);
            graphics.drawLine(n13, n + this.n - 3, this.R, n + this.n - 3);
            graphics.drawLine(n13, n - this.n + 3, this.R, n - this.n + 3);
            this.a(graphics, this.w >> 1);
            this.a(graphics, 0, this.b.b >> 2, this.w >> 1);
            this.a(graphics);
            return;
        }
        if (by == 0) {
            this.k.a(graphics, this.B[this.z], this.Q - (this.k.a(this.B[this.z]) >> 1), (this.b.b >> 3) - (this.M >> 1), 20);
        }
        int n = this.G;
        while (n < this.x + this.G) {
            int n14;
            int n15;
            int n16 = this.h + (n - this.G) * this.L + (this.L >> 1);
            int n17 = this.S + this.P;
            if (this.a == n) {
                graphics.setColor(0xCB0000);
                n15 = this.P >> 2;
                n14 = this.M >> 2;
            } else {
                graphics.setColor(2967296);
                n15 = 0;
                n14 = 0;
            }
            if ((by == 13 || by == 14) && n != this.z - 1 && n > this.b.N) {
                graphics.setColor(7108187);
            }
            graphics.fillRect(this.Q - (this.R - this.S + this.P >> 1) + 5 - n15, n16 - (this.m - 4 >> 1), this.R - this.S + this.P - 10 + (n15 << 1), this.m - 4);
            graphics.setClip(this.R + n15, n16 - this.n, this.P, this.m);
            graphics.drawImage(this.b.k, this.R + n15 - this.P, n16 - this.n, 20);
            graphics.setClip(this.S - n15, n16 - this.n, this.P, this.m);
            graphics.drawImage(this.b.k, this.S - n15, n16 - this.n, 20);
            graphics.setClip(0, 0, this.b.e, this.b.b);
            String string = this.B[n];
            switch (by) {
                case 1: {
                    if (n == 3) {
                        string = e.V ? string + this.b.Z[1] : string + this.b.Z[0];
                    }
                    if (n == 4) {
                        string = string + e.n;
                    }
                    this.k.a(graphics, string, this.Q - (this.k.a(string) >> 1), n16 - (this.M >> 1) + n14 - 1, 20);
                    break;
                }
                case 2: {
                    if (n == 0) {
                        string = e.ac ? string + this.b.Z[1] : string + this.b.Z[0];
                    }
                    if (n == 1) {
                        string = e.V ? string + this.b.Z[1] : string + this.b.Z[0];
                    }
                    this.k.a(graphics, string, this.Q - (this.k.a(string) >> 1), n16 - (this.M >> 1) + n14 - 1, 20);
                    break;
                }
                default: {
                    this.k.a(graphics, this.B[n], this.Q - (this.k.a(this.B[n]) >> 1), n16 - (this.M >> 1) + n14 - 1, 20);
                }
            }
            graphics.setColor(0);
            graphics.drawLine(n17 - n15, n16 - this.n + 4, this.R + (n15 << 1), n16 - this.n + 4);
            graphics.drawLine(n17 - n15, n16 + this.n - 4, this.R + (n15 << 1), n16 + this.n - 4);
            graphics.drawLine(n17 - n15, n16 + this.n - 2, this.R + (n15 << 1), n16 + this.n - 2);
            graphics.drawLine(n17 - n15, n16 - this.n + 2, this.R + (n15 << 1), n16 - this.n + 2);
            graphics.setColor(0xBBB800);
            graphics.drawLine(n17 - n15, n16 + this.n - 3, this.R + (n15 << 1), n16 + this.n - 3);
            graphics.drawLine(n17 - n15, n16 - this.n + 3, this.R + (n15 << 1), n16 - this.n + 3);
            ++n;
        }
        graphics.setColor(0xFFFFFF);
        if (this.x + this.G < this.z) {
            graphics.setClip(this.Q - (this.b.p.getWidth() >> 1), this.h + this.L * (this.x - 1) + this.L, this.b.p.getWidth(), this.b.p.getHeight() >> 1);
            graphics.drawImage(this.b.p, this.Q - (this.b.p.getWidth() >> 1), this.h + this.L * (this.x - 1) + this.L - (this.b.p.getHeight() >> 1), 20);
        }
        if (this.G > 0) {
            graphics.setClip(this.Q - (this.b.p.getWidth() >> 1), this.h - (this.b.p.getHeight() >> 1), this.b.p.getWidth(), this.b.p.getHeight() >> 1);
            graphics.drawImage(this.b.p, this.Q - (this.b.p.getWidth() >> 1), this.h - (this.b.p.getHeight() >> 1), 20);
        }
        this.a(graphics);
        if (by == 5) {
            this.a(graphics, (byte)this.a, by);
        }
    }
}

