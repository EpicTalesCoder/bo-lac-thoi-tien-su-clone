import java.io.OutputStream;
import java.io.DataOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import javax.microedition.rms.RecordStore;
import java.io.DataInputStream;
import javax.microedition.lcdui.Displayable;
import java.util.Random;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import javax.microedition.lcdui.Canvas;

// 
// Decompiled by Procyon v0.6.0
// 

public final class f extends Canvas implements Runnable
{
    static int a;
    static int b;
    boolean a;
    tribes a;
    b a;
    c a;
    boolean b;
    int c;
    int d;
    int e;
    int f;
    int g;
    int h;
    int i;
    int j;
    int k;
    boolean c;
    static byte a;
    String a;
    boolean d;
    byte b;
    byte c;
    byte d;
    int l;
    byte[] a;
    short[] a;
    short[] b;
    short[] c;
    byte e;
    static byte f;
    static byte g;
    byte[] b;
    a a;
    byte h;
    int m;
    boolean e;
    boolean f;
    boolean g;
    boolean h;
    boolean i;
    boolean j;
    boolean k;
    byte i;
    static boolean l;
    static boolean m;
    byte j;
    int n;
    int o;
    int p;
    boolean n;
    boolean o;
    boolean p;
    byte k;
    byte l;
    boolean q;
    int q;
    int r;
    int s;
    int t;
    int u;
    boolean r;
    int v;
    int w;
    int x;
    int y;
    int z;
    byte m;
    byte n;
    byte o;
    boolean s;
    byte p;
    byte q;
    byte r;
    byte s;
    byte t;
    byte u;
    byte v;
    short a;
    short b;
    int A;
    int[][] a;
    byte w;
    byte x;
    byte y;
    byte z;
    byte A;
    byte B;
    byte C;
    byte D;
    int B;
    int C;
    int D;
    int E;
    boolean t;
    boolean u;
    byte E;
    int F;
    int G;
    int H;
    byte F;
    byte G;
    byte[][] a;
    boolean v;
    boolean w;
    int I;
    byte H;
    int J;
    int K;
    int L;
    int M;
    byte I;
    byte J;
    byte K;
    byte L;
    int N;
    int O;
    int P;
    int Q;
    int R;
    int S;
    int T;
    int[] a;
    int[] b;
    int[] c;
    int[] d;
    byte[] c;
    byte[] d;
    static final Image[] a;
    static final Graphics[] a;
    static byte M;
    byte N;
    short c;
    short d;
    short e;
    short f;
    byte O;
    byte P;
    byte[][] b;
    byte[][] c;
    int[][][] a;
    boolean[][] a;
    short[][] a;
    byte[] e;
    byte[][] d;
    boolean x;
    int[] e;
    byte[] f;
    byte[] g;
    byte[] h;
    byte[] i;
    byte[][] e;
    byte[][][] a;
    byte[][] f;
    byte[][][] b;
    byte[][][] c;
    int U;
    int V;
    byte[][] g;
    byte[][] h;
    byte[][] i;
    Image[][] a;
    short[][] b;
    byte[][] j;
    int W;
    int X;
    int[][] b;
    int Y;
    byte Q;
    byte R;
    byte S;
    int Z;
    int aa;
    int ab;
    byte T;
    byte U;
    byte V;
    boolean y;
    byte W;
    int ac;
    boolean z;
    int ad;
    int ae;
    boolean A;
    boolean B;
    boolean C;
    int af;
    int ag;
    int ah;
    int ai;
    int aj;
    int ak;
    int al;
    int am;
    boolean D;
    byte X;
    int an;
    int ao;
    int ap;
    int aq;
    int ar;
    int as;
    int at;
    byte Y;
    int au;
    int av;
    int aw;
    int ax;
    int ay;
    int az;
    int aA;
    int aB;
    byte Z;
    byte aa;
    byte ab;
    byte ac;
    int aC;
    boolean E;
    byte ad;
    boolean[] a;
    boolean[] b;
    boolean[] c;
    boolean[] d;
    boolean F;
    byte[] j;
    byte[] k;
    short[] d;
    int aD;
    int aE;
    int aF;
    int aG;
    int aH;
    int aI;
    int aJ;
    int aK;
    byte ae;
    boolean G;
    static byte af;
    int[] f;
    byte[] l;
    byte[] m;
    byte[] n;
    byte[] o;
    static byte ag;
    static byte ah;
    int aL;
    int aM;
    int aN;
    int aO;
    boolean H;
    boolean I;
    int aP;
    int aQ;
    byte ai;
    int aR;
    byte aj;
    byte ak;
    byte al;
    byte am;
    byte an;
    int aS;
    byte[] p;
    int aT;
    byte ao;
    boolean J;
    boolean K;
    byte ap;
    boolean L;
    boolean M;
    boolean N;
    boolean O;
    byte aq;
    byte[] q;
    boolean P;
    boolean Q;
    boolean R;
    byte ar;
    byte as;
    static int aU;
    static int aV;
    int aW;
    int aX;
    int aY;
    int aZ;
    byte at;
    byte au;
    byte av;
    boolean S;
    byte[] r;
    byte[] s;
    boolean T;
    boolean U;
    boolean V;
    byte aw;
    byte[] t;
    int ba;
    int bb;
    byte ax;
    byte[] u;
    byte[][] k;
    int[] g;
    byte ay;
    int[] h;
    byte[] v;
    int bc;
    int bd;
    int be;
    int bf;
    String b;
    boolean W;
    boolean X;
    Random a;
    boolean Y;
    boolean Z;
    boolean aa;
    boolean ab;
    boolean ac;
    boolean ad;
    static short[] e;
    static short[] f;
    static byte[] w;
    int[] i;
    int[] j;
    boolean ae;
    boolean af;
    boolean ag;
    
    public f(final tribes a) {
        this.a = true;
        this.j = 120;
        this.k = 1;
        this.l = 1;
        final String[] array = { "en", "fr", "it", "de", "es" };
        this.v = -1;
        this.w = -1;
        this.s = -1;
        this.t = -1;
        this.v = 2;
        this.t = false;
        this.u = false;
        this.v = false;
        this.w = false;
        this.N = 1;
        this.c = 96;
        this.d = 96;
        this.e = 96;
        this.f = 96;
        this.g = new byte[11];
        this.h = new byte[11];
        this.i = new byte[11];
        this.U = 5;
        this.V = 4;
        this.ac = 1000;
        this.an = -1;
        this.a = new boolean[20];
        this.b = new boolean[20];
        this.c = new boolean[9];
        this.d = new boolean[9];
        this.j = new byte[8];
        this.f = new int[] { 0, 5251341, 16704820, 16033043, 12010496 };
        this.l = new byte[] { 0, 1, 1, 1, 1 };
        this.m = new byte[] { 0, 1, 1, 2, 3 };
        this.n = new byte[] { 100, 98, 0, 0, 0 };
        this.o = new byte[] { 5, 3, 1, 1, 1 };
        this.p = new byte[40];
        this.aq = 2;
        this.q = new byte[2];
        this.as = 3;
        this.aw = 2;
        this.u = new byte[10];
        this.k = new byte[3][10];
        this.g = new int[10];
        this.b = "t";
        this.a = new Random(1L);
        this.Y = false;
        this.Z = false;
        this.aa = false;
        this.setFullScreenMode(true);
        this.a = a;
    }
    
    public final void a() {
        new Thread(this).start();
    }
    
    public final void b() {
        this.b = false;
        this.z = false;
        this.aR();
        this.a.notifyDestroyed();
    }
    
    private void f() {
        this.a = new b();
        System.gc();
        Thread.yield();
        new e(this);
        f.af = 98;
        this.a(0);
        this.a.a.setCurrent((Displayable)this);
        this.y = true;
    }
    
    private void g() {
        System.gc();
        Thread.yield();
        this.g = new byte[this.P + 3][this.O];
        this.h = new byte[13][101];
        this.i = new byte[13][101];
        this.a = new int[2][3][96];
        this.a = new boolean[this.P + 3][this.O];
        System.gc();
        Thread.yield();
        this.a = new byte[5][50];
        this.a = new short[2][26];
        this.d = new byte[7][40];
        this.e = new int[] { 14680064, 14999808, 55808, 55808 };
        this.f = new byte[12];
        this.e = new byte[3][30];
        this.a = new byte[2][10][12];
        this.f = new byte[4][30];
        this.b = new byte[2][5][30];
        this.c = new byte[2][5][5];
        System.gc();
        Thread.yield();
        this.b = new int[][] { { 7250486, 11637795, 2652080, 2454300, 3881776, 4605510, 16766976, 14352640, 10966528, 16750080, 7406848, -1 }, { 5276696, 8810262, 678290, 480512, 1907986, 2631720, 16766976, -1, -1, 16750080, 5439488, -1 } };
        this.k = new byte[107];
        this.d = new short[107];
        this.r = new byte[50];
        this.s = new byte[100];
        System.gc();
        Thread.yield();
        this.a.a = new byte[2][101][80];
        this.a.b = new byte[2][22][5];
        this.a.c = new byte[5][6][6];
        this.a.a = new byte[5][50];
        this.a.c = new byte[2];
        this.a.d = new byte[6];
        this.a.e = new byte[3];
        this.a.f = new byte[3];
        this.a.d = new byte[3][2][96];
        this.a.g = new byte[3];
        this.a.e = new byte[2][3][10];
        this.a.h = new byte[10];
        this.a.c = new byte[6][10];
        this.a.a = new boolean[3];
        this.a.d = new byte[2][50];
        this.a.d = new short[6];
        this.a.i = new byte[8];
        this.a.e = new byte[4][8];
        this.a.f = new byte[2][10];
        this.a.g = new byte[3][20];
        this.a.j = new byte[50];
        this.a.k = new byte[4];
        this.i = new int[6];
        this.j = new int[] { 56, 55, 51, 57, 49 };
        this.t = new byte[3];
    }
    
    public final void run() {
        try {
            this.f();
            this.g();
            this.a.a(this);
            if (!this.d(0)) {
                this.d(1);
                this.d(2);
            }
            this.Q = 14;
            this.v = 0;
            this.H = true;
            this.R = this.U;
            this.v = 59;
            this.c = -1;
            this.k[55] = -1;
            this.a[0][3] = -1000;
            this.aa = true;
            this.b = true;
            this.i();
            while (this.b) {
                final long a = a();
                this.aS();
                this.h();
                if (!this.b) {
                    return;
                }
                this.m();
                this.l();
                while (this.z && !this.Z) {
                    Thread.yield();
                }
                if (this.ad != 0 || this.ae != 0) {
                    final int n = 0;
                    this.ae = n;
                    this.ad = n;
                    tribes.a(this.i / 2);
                    this.l();
                    while (this.z && !this.Z) {
                        Thread.yield();
                    }
                }
                long n2;
                if ((n2 = this.i - (a() - a)) < 0L || n2 > this.i) {
                    n2 = 0L;
                }
                tribes.a((int)n2);
            }
        }
        catch (final Exception ex) {}
    }
    
    private void h() {
        this.i = (this.c ? 50 : this.j);
        this.k = this.j / this.i;
        ++this.e;
        if (this.e >= 6) {
            this.E = false;
            this.q = false;
        }
        if (this.e >= 8) {
            this.e = 0;
        }
        Thread.yield();
        if (this.v == 0) {
            this.ak();
            this.o = false;
        }
        else if (this.v == 1) {
            if (this.i == 0) {
                this.i = -1;
                if (this.w != 3 && !this.a[6] && !this.a[8] && !this.a[7]) {
                    if (this.a[0]) {
                        this.m = 0;
                    }
                    else if (this.a[4]) {
                        this.m = 1;
                        if (this.a[this.a[296] + this.a.g] == 3) {
                            this.a.J = (byte)(120 - this.a[this.a[298] + this.a.g]);
                        }
                    }
                    this.v = 0;
                    this.l(this.a[this.a[305] + this.a[this.a[306] + this.m] + 0]);
                    this.Q = 25;
                    this.R = 28;
                    this.Z = 0;
                    this.H = true;
                    this.z = this.y;
                    this.B = this.A;
                    this.J = this.I;
                    this.L = this.K;
                }
            }
            else if (this.w == 2 || this.w == 4) {
                this.ae();
                this.o = false;
            }
            else {
                this.V();
                this.o = false;
                this.k();
            }
            if (this.v == 1) {
                ++this.d;
                if (this.d > 5) {
                    this.d = 0;
                    this.a((byte)100, (byte)0, (byte)0, (byte)0);
                }
                if (this.E <= 4) {
                    ++this.E;
                }
                else if (this.E >= 0) {
                    this.n = 0;
                }
                ++this.j;
                this.j();
            }
        }
        ++this.g;
        ++this.f;
        if (this.f >= 120) {
            this.f = 0;
        }
        if (this.o < 3) {
            ++this.o;
            this.n = true;
        }
        else if (this.o == 3) {
            ++this.o;
            this.i();
            this.n = false;
        }
        if (this.k) {
            this.k = false;
            this.s = 0;
            this.l(-1);
            this.a(true, true, this.P = false, false);
            this.F = false;
            this.w = 0;
            this.k = 0;
            this.q = 0;
            final int n = 0;
            this.E = n;
            this.D = n;
            this.C = n;
            this.B = n;
            this.F = -1;
            this.aI();
            this.u = false;
            this.t = false;
            this.i();
        }
        if (this.p) {
            this.p = false;
            this.i();
        }
        ++this.p;
    }
    
    private void i() {
        f.l = (f.m = false);
        final boolean b = false;
        this.h = b;
        this.g = b;
        this.f = b;
        this.e = b;
        final boolean b2 = false;
        this.v = b2;
        this.i = b2;
        this.E = 4;
        this.w = false;
        this.i = -1;
        this.t = false;
        this.n = 0;
    }
    
    private void j() {
        try {
            this.a.g();
            this.a.e();
            this.a.h();
            this.a.i();
        }
        catch (final Exception ex) {}
        ++this.c;
        ++this.h;
        if (this.h >= 100) {
            final int n;
            if ((n = this.h - 100) >= this.d - 1) {
                this.h = 0;
            }
            for (short n2 = 0; n2 < this.c; ++n2) {
                if (this.c[n][n2] <= -114 && this.c[n][n2] > -117) {
                    this.c[n][n2] = 0;
                    this.c(n2, n, 1, 1);
                }
            }
        }
        if (this.P && this.w != 4 && this.w != 3) {
            this.Z();
        }
        this.P = false;
        if (this.u > 0 && this.v == 1) {
            ++this.u;
            if (this.u == 41 || this.u == 90) {
                this.v = 0;
                this.Q = 24;
                this.H = true;
                this.v = 56 + 41 / this.u;
                this.o = (byte)(11 - 41 / this.u);
                this.o = 0;
            }
        }
    }
    
    private void k() {
        final int n = this.I + this.y;
        final int n2 = this.K + this.A;
        try {
            final byte w = this.c[n2][n];
            if (this.u || (w <= -1 && w >= -30)) {
                this.W = 0;
                return;
            }
            boolean b = false;
            if ((w >= 51 && this.w == 1) || (w >= 1 && w <= 50)) {
                this.W = w;
            }
            else {
                for (int i = -1; i <= 1; ++i) {
                    for (int j = -1; j <= 1; ++j) {
                        final byte w2;
                        if (n + j >= 0 && n2 + i >= 0 && n + j < this.c && n2 + i < this.d && (((w2 = this.c[n2 + i][n + j]) >= 51 && this.w == 1) || (w2 >= 1 && w2 <= 50))) {
                            final byte b2 = this.e[202 + w2];
                            final byte b3 = this.e[303 + w2];
                            final int n3 = (i < 0) ? (16 - b3) : ((i == 0) ? 0 : (16 + b3));
                            int n5;
                            final int n4 = (n3 * n3 + ((j < 0) ? (n5 = 22 - b2) : ((j == 0) ? (n5 = 0) : (n5 = 22 + b2))) * n5) / 2;
                            if (this.W == w2 && (n4 < 13 || w2 <= 50)) {
                                this.ac = n4;
                                b = true;
                            }
                            if (n4 < this.ac && (n4 < 13 || w2 <= 50)) {
                                this.ac = n4;
                                this.W = w2;
                                b = true;
                            }
                        }
                    }
                }
                if (!b) {
                    this.W = 0;
                    this.ac = 1000;
                }
            }
            if (this.W < 50 && this.w == 1) {
                this.W = 0;
            }
        }
        catch (final Exception ex) {}
    }
    
    private void l() {
        this.z = true;
        this.repaint();
        Thread.yield();
    }
    
    protected final void paint(final Graphics graphics) {
        if (this.v == 1) {
            int n;
            if (this.ad == 0 && this.ae == 0) {
                n = this.c[1];
            }
            else {
                n = 3;
            }
            a(graphics, f.a[n], 0, 0, 262, this.A, this.a - 11 + this.ad, this.b - 8 + this.bb - this.ax + this.ae + 0, 0);
            for (int i = 0; i < 20; i = (byte)(i + 1)) {
                if (this.a[i]) {
                    a(graphics, f.a[this.c[this.a[this.a[195] + 0 + i]]], 0, this.c[this.a[this.a[195] + 0 + i]], this.a[this.a[this.a[195] + 0 + i]] + 11, this.b[this.a[this.a[195] + 0 + i]], this.a - 11, this.b + this.d[this.a[this.a[195] + 0 + i]] + 0, 0);
                    if (i == 8 || i == 7) {
                        this.a(graphics, 556, this.a + this.a[this.a[this.a[195] + 0 + i]] - 68, this.b + this.b[this.a[this.a[195] + 0 + i]] - 55 + this.bb + this.d[this.a[this.a[195] + 0 + i]] + 0 + 5);
                    }
                    if (this.a[this.a[195] + 20 + i] == 1) {
                        this.a(graphics, 524, this.a, this.b + this.bb + 0);
                    }
                    else if (this.a[this.a[195] + 20 + i] == 2) {
                        this.a(graphics, 528, this.a, this.b + 320 - this.ba + 0);
                    }
                }
            }
        }
        else {
            a(graphics, f.a[f.M], 0, 0, 251, 328, this.a - 11, this.b - 8 + 0, 0);
            if (this.s && !this.J && this.aP < 0) {
                graphics.setColor(0);
                a(graphics, this.a - 11, this.b - 8 + 0, 240, 16 + -this.aP);
                a(graphics, this.a - 11, this.b - 8 + 16 + 320 - -this.aP + 0, 240, -this.aP);
            }
        }
        this.z = false;
    }
    
    private void m() {
        if (this.v == 1) {
            this.N = this.c[1];
            this.n();
            this.w();
            this.u();
            f.a[3].drawImage(f.a[this.c[1]], 0, 0, 0);
            this.N = 3;
            this.c(this.y * 22 - this.ad, this.A * 16 - this.ae);
            this.N = this.c[1];
            this.c(this.y * 22, this.A * 16);
            this.S = false;
            for (byte b = 0; b < 20; ++b) {
                if (this.a[b]) {
                    this.a(b, 0, this.c[this.a[this.a[195] + 0 + b]] - 8);
                    this.N = this.c[1];
                    if (this.a[this.a[195] + 20 + b] == 1) {
                        this.a(524, 0, this.ax);
                    }
                    else if (this.a[this.a[195] + 20 + b] == 2) {
                        this.a(528, 0, 320 - this.bb - this.ba + this.ax);
                    }
                }
            }
            return;
        }
        if (this.v == 0) {
            this.F();
        }
    }
    
    private void n() {
        try {
            if (this.ag != 0 && this.af != 0) {
                this.A = true;
            }
            this.aj = 0;
            this.ak = 0;
            if (this.A) {
                this.A = false;
                this.C = false;
                this.al = this.O - 1;
                this.am = this.P - 1;
                final int n = 0;
                this.ag = n;
                this.af = n;
                this.o();
            }
            else {
                this.ai = 0;
                this.am = -1;
                if (this.af != 0) {
                    this.aj = -this.af * 22;
                }
                else if (this.ag != 0) {
                    this.ak = -this.ag * 16;
                }
                a(f.a[this.c[1]], f.a[this.c[0]], 0, 0, 264, this.A, this.aj, this.ak, 0);
                if (this.af != 0) {
                    this.aj = ((this.af - 2) / 2 + 1) * (this.O - 1);
                    this.al = this.aj;
                    this.ak = 0;
                    this.am = this.P - 1;
                    this.af = 0;
                    this.o();
                }
                if (this.ag != 0) {
                    this.ak = ((this.ag - 2) / 2 + 1) * (this.P - 1);
                    this.am = this.ak;
                    this.aj = 0;
                    this.al = this.O - 1;
                    this.ag = 0;
                    this.o();
                }
                if (this.C) {
                    this.C = false;
                    this.aj = 0;
                    this.al = this.O - 1;
                    this.ak = this.P - 1 - 3;
                    this.am = this.P - 1;
                    this.o();
                }
                if (this.B) {
                    this.B = false;
                    this.aj = 0;
                    this.al = this.O - 1;
                    this.ak = 0;
                    this.am = this.P - 1;
                    this.D = true;
                    this.o();
                    this.D = false;
                }
            }
            if (this.am != -1 && !this.s) {
                a(f.a[this.c[0]], f.a[this.c[1]], 0, 0, 264, this.A, 0, 0, 0);
            }
        }
        catch (final Exception ex) {}
    }
    
    private void o() {
        this.ai = this.ak;
        while (this.ai <= this.am) {
            this.ah = this.aj;
            while (this.ah <= this.al) {
                Label_0220: {
                    if (this.D) {
                        if (!this.a[this.ai][this.ah]) {
                            break Label_0220;
                        }
                        this.a[this.ai][this.ah] = false;
                    }
                    if (!this.s || this.b(this.ah + this.I, this.ai + this.K)) {
                        final int n;
                        if ((n = (this.b[this.ai + this.K][this.ah + this.I] & 0xFF)) < 175) {
                            this.a(n, this.ah * 22, this.ai * 16);
                        }
                        else {
                            this.a(n, (byte)0);
                        }
                        final byte b;
                        if ((b = this.c[this.ai + this.K][this.ah + this.I]) < 0 && b >= -123) {
                            this.a((int)b, (byte)0);
                        }
                    }
                }
                ++this.ah;
            }
            ++this.ai;
        }
    }
    
    private void a(final int n, byte b) {
        int n2 = -n;
        int i = 0;
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        int s = this.ah * 22;
        int t = this.ai * 16;
        if (b(n) != 2) {
            i = this.e[8749 + n2];
            final byte b2 = this.a[this.a[138] + 104 + i];
            n3 = this.e[9115 + n2];
            n4 = this.ah + this.I - this.e[8383 + n2];
            n5 = this.ai + this.K - this.e[8444 + n2];
            s -= n4 * 22;
            t -= n5 * 16;
            this.N = this.b[0][i + 1];
            this.O = this.j[0][i + 1];
            if (b == 0) {
                int n6 = 0;
                final int n7 = b2 * n5 + n4;
                while (true) {
                    if ((this.j[3][this.N] & 0xFF) >> 6 == 0) {
                        if (n6 == n7) {
                            break;
                        }
                        ++n6;
                    }
                    if ((this.j[3][this.N] & 0x7) != 0x0) {
                        break;
                    }
                    ++this.N;
                    --this.O;
                }
            }
            else {
                for (byte b3 = this.e[8993 + n2]; b3 > 0; b3 = this.e[4545 + b3]) {
                    this.g[this.e[4646 + b3]] = b3;
                }
            }
        }
        else if (c(n)) {
            n2 -= 61;
            i = this.e[9833 + n2];
            n3 = this.e[9933 + n2];
            this.N = this.b[0][i + 27 - 1];
            this.O = this.j[0][i + 27 - 1];
        }
        else if (c(n) != 2) {
            if (c(n) != 3) {
                this.g[0] = this.c[this.K + this.ai][this.I + this.ah];
                if (c((int)this.g[0]) != 2) {
                    if (c((int)this.g[0]) == 1) {
                        b = -1;
                    }
                    i = 20 - (this.g[0] + 111);
                    n3 = 1;
                }
                else if (c((int)this.e[4545 + this.g[0]]) != 2) {
                    i = 20 - (this.e[4545 + this.g[0]] + 111);
                    n3 = 2;
                }
                while (i > 22) {
                    i -= 3;
                }
            }
            else {
                i = 23;
                n3 = 0;
            }
            this.N = this.b[0][i + 1];
            this.O = this.j[0][i + 1];
            n2 = 0;
        }
        else if (n >= 1000) {
            s = this.S;
            t = this.T;
            i = n - 1000;
            this.N = this.b[0][i];
            this.O = this.j[0][i];
            if (this.v == 0) {
                this.g[0] = 1;
                this.g[1] = 2;
                this.g[2] = 3;
                this.e[2930] = 39;
                this.e[2931] = 42;
                this.e[2932] = 42;
                this.e[607] = 1;
                this.e[608] = 0;
                this.e[609] = 6;
                this.e[1415] = 25;
                this.e[1416] = 45;
                this.e[1417] = 70;
                this.e[3031] = (byte)(this.f % 8);
                this.e[3032] = (byte)(this.f % 8);
                this.e[3033] = (byte)(this.f % 10);
                this.e[5152] = 8;
                this.e[6566] = 9;
                this.e[5153] = 5;
                this.e[6567] = 2;
                this.e[5154] = 10;
                this.e[6568] = 0;
                final byte[] e = this.e;
                final int n8 = 1314;
                final byte[] e2 = this.e;
                final int n9 = 1315;
                final byte[] e3 = this.e;
                final int n10 = 1316;
                final byte b4 = 0;
                e3[n10] = b4;
                e[n8] = (e2[n9] = b4);
                final byte[] e4 = this.e;
                final int n11 = 6465;
                final byte[] e5 = this.e;
                final int n12 = 6466;
                final byte[] e6 = this.e;
                final int n13 = 6467;
                final byte b5 = 0;
                e6[n13] = b5;
                e4[n11] = (e5[n12] = b5);
            }
            n3 = (n2 = 0);
        }
        else if (n >= 175) {
            i = n - 180 + 34;
            this.N = this.b[0][i];
            this.O = this.j[0][i];
            t += this.aQ;
            n3 = (n2 = 0);
        }
        if (b == 0) {
            do {
                this.P = (this.j[3][this.N] & 0xFF) >> 6;
                if (this.P <= n3) {
                    this.a(this.b[1][this.N] & 0xFFF, (this.ah - n4) * 22 + this.j[1][this.N], (this.ai - n5) * 16 + this.j[2][this.N]);
                }
                ++this.N;
                if ((this.j[3][this.N] & 0x7) == 0x0) {
                    continue;
                }
                break;
            } while ((this.j[3][this.N] & 0xFF) >> 6 != 0);
        }
        else {
            this.a(n2, (byte)n3, (byte)i, s, t, b);
        }
        for (int j = 0; j < 8; j = (byte)(j + 1)) {
            final byte[] g = this.g;
            final int n14 = j;
            final byte[] h = this.h;
            final int n15 = j;
            final byte[] k = this.i;
            final int n16 = j;
            final byte b6 = 0;
            k[n16] = b6;
            g[n14] = (h[n15] = b6);
        }
    }
    
    private void a(final int n, final byte b, final byte b2, final int n2, final int n3, final byte b3) {
        int i = this.f;
        this.U = 0;
        try {
            for (int j = 0; j < this.O; ++j) {
                final int n4 = this.j[3][this.N] & 0x7;
                final byte b4 = (byte)((this.j[3][this.N] & 0x3F) >> 3);
                this.P = (this.j[3][this.N] & 0xFF) >> 6;
                this.X = this.g[b4];
                int n5 = 0;
                final int n6 = (this.b[1][this.N] & 0xC000) >> 14 << 7;
                if (n4 == 0 && b3 == 2 && this.P == b) {
                    this.a(this.b[1][this.N] & 0xFFF, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N]);
                }
                else if (n4 == 1 && this.P <= b) {
                    if (b2 == 6 && this.U < 5) {
                        this.a[0][this.a[this.a[142]]] = (byte)(this.a[0][5] + this.a[0][8] + this.a[0][5] + this.a[0][9] + this.a[0][10]);
                        if (this.a[0][this.a[this.a[142] + this.U]] > 0 || n >= 31) {
                            this.V = this.a[0][this.a[this.a[142] + this.U]] / 7 / ((this.U == 0) ? 1 : 10);
                            if (this.V >= 5 || n >= 31) {
                                this.V = 4;
                            }
                            this.a((this.b[1][this.N] & 0xFFF) + this.V, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N]);
                        }
                        ++this.U;
                    }
                    else if (b2 == 4 && this.U < 1) {
                        if (n >= 31) {
                            this.a((this.b[1][this.N] & 0xFFF) + 2, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N]);
                        }
                        else if (this.a[0][0] >= 5) {
                            this.V = ((this.a[0][0] > 35) ? 2 : ((this.a[0][0] - 5) / 15));
                            this.a((this.b[1][this.N] & 0xFFF) + this.V, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N]);
                        }
                        ++this.U;
                    }
                    else {
                        this.a(this.b[1][this.N] & 0xFFF, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N]);
                    }
                }
                else if ((n4 == 2 || n4 == 4 || n4 == 6) && b3 != 2) {
                    if (this.P == 0 || this.P <= b) {
                        final int n7 = this.N;
                        int n8 = this.b[1][this.N] & 0xFFF;
                        if (n4 == 6) {
                            for (i += this.K + this.ai + this.N * 2; i >= 120; i -= 120) {}
                            if (b4 == 1 || (b4 == 2 && (this.e[8627 + n] == 1 || this.e[8627 + n] == 2))) {
                                if (n >= 31) {
                                    ++n8;
                                }
                                n5 = 1;
                            }
                            else if (b4 != 2) {
                                n5 = 1;
                            }
                        }
                        else if (this.q == 3 && n == 31 && b4 == 0) {
                            if (n8 == 116 && n4 == 4) {
                                n5 = 1;
                                i = 0;
                            }
                        }
                        else if (n4 == 2 && (this.e[1313 + this.X] <= 0 || this.e[1313 + this.X] >= 50)) {
                            n5 = 1;
                            if (this.e[1313 + this.X] == 51) {
                                this.i[b4] = 1;
                            }
                        }
                        else if (n4 == 4 && this.i[b4] == 0 && this.e[1313 + this.X] >= 1 && this.e[1313 + this.X] != 50) {
                            n8 = (this.b[1][this.N + this.e[1313 + this.X] - 1] & 0xFFF);
                            i = this.e[3030 + this.X];
                            n5 = 1;
                            this.i[b4] = 1;
                            if (this.e[8749 + n] == 2 && this.e[1313 + this.X] == 2) {
                                this.d(90, n2 + this.j[1][n7] + n6, n3 + this.j[2][n7], this.f);
                            }
                        }
                        if (n5 != 0) {
                            this.d(n8, n2 + this.j[1][n7] + n6, n3 + this.j[2][n7], i);
                        }
                    }
                }
                else if ((n4 == 3 || n4 == 5 || n4 == 7) && this.h[b4] == 0 && this.X > 0 && b3 != 2) {
                    int n9 = 0;
                    if (n < 31 || (this.e[9176 + n] & 0x3) >= 2) {
                        if (n4 == 7 && this.e[1313 + this.X] == 50) {
                            n5 = 1;
                        }
                        else if (n4 == 3 && this.e[1313 + this.X] >= 1 && this.e[1313 + this.X] != 50) {
                            switch (n9 = this.a[this.a[139] + this.a[this.a[140] + b2] + b4]) {
                                case -1: {
                                    n9 = this.e[606 + this.X];
                                    break;
                                }
                            }
                            n5 = 1;
                        }
                        else if (n4 == 5 && this.e[1313 + this.X] <= 0) {
                            n5 = 1;
                            if ((this.e[3535 + this.X] != 0 || this.e[6565 + this.X] == 1) && b2 != 10 && b2 != 11) {
                                this.x = true;
                            }
                            if (this.v == 0) {
                                n9 = this.e[606 + this.X];
                            }
                        }
                    }
                    if (n5 != 0) {
                        this.a(this.X, n2 + this.j[1][this.N] + n6, n3 + this.j[2][this.N], n9, (byte)29);
                        this.h[b4] = 1;
                    }
                }
                ++this.N;
            }
        }
        catch (final Exception ex) {}
        this.X = 0;
    }
    
    private void a(final int aq, final int ar, final int as, final int at, final byte y) {
        try {
            this.aq = aq;
            this.ar = ar;
            this.as = as;
            this.at = at;
            this.Y = y;
            this.av = (this.e[this.b[this.Y] + this.aq] & 0xFF);
            if (this.at >= 0) {
                this.at = this.a[this.a[99] + ((this.b[3][this.av] >> 14 & 0x3) << 3) + this.at];
                final int n = (this.b[2][this.av] & 0xFFF) + this.at * this.j[4][this.av] + this.e[this.b[this.Y + 1] + this.aq];
                this.au = this.b[4][n];
                this.ar += this.j[7][n];
                this.as += this.j[8][n] + this.aQ;
                if (this.x) {
                    if (this.av != 124) {
                        this.au += 48;
                        this.av = 1;
                    }
                    this.x = false;
                }
                if (this.av == 141 || this.av == 142 || this.av == 143 || this.av == 144) {
                    this.ar += 22 * this.a[this.a[1] + this.e[606 + this.aq]];
                }
            }
            else {
                this.av = -this.at;
                if (this.e[1414 + this.aq] < 12) {
                    this.av = 14;
                    this.as -= 6;
                }
                this.au = this.b[4][(this.b[2][this.av] & 0xFFF) + 2];
            }
            this.aw = (this.b[2][this.av] & 0xF000) >> 14;
            this.p();
            if (this.v != 0) {
                this.q();
            }
        }
        catch (final Exception ex) {}
    }
    
    private void p() {
        this.aA = this.b[8][this.au];
        this.ao = -1;
        this.ap = -1;
        this.aB = 0;
        while (this.aB < this.j[15][this.au]) {
            this.az = this.aA + this.aB;
            Label_0460: {
                if (this.b[7][this.az] != 0) {
                    this.ax = 0;
                    this.ay = (this.j[14][this.az] & 0xF);
                    if (this.Y == 29) {
                        if (!this.a()) {
                            break Label_0460;
                        }
                        if (this.e[1414 + this.aq] >= 12) {
                            if (this.aq >= 51) {
                                this.an = 4;
                            }
                            if (!this.b()) {
                                break Label_0460;
                            }
                        }
                        else {
                            if (this.ay == 7 && this.e[1515 + this.aq] == 0) {
                                break Label_0460;
                            }
                            if (this.ay == 0) {
                                this.ap = this.az;
                                if (this.aq >= 51) {
                                    ++this.ax;
                                }
                            }
                            else if (this.ay == 9) {
                                this.ao = this.az;
                                this.ax = (this.e[5151 + this.aq] & 0x1);
                            }
                            else if (this.ay == 5) {
                                break Label_0460;
                            }
                        }
                        if (this.b[7][this.az] == 1) {
                            break Label_0460;
                        }
                    }
                    else if (this.ay == 0) {
                        final int az = this.az;
                        this.ap = az;
                        this.ao = az;
                    }
                    if ((this.j[14][this.az] & 0xFF) >> 7 == 0) {
                        this.b(this.b[7][this.az] + this.ax, this.ar + this.j[12][this.az], this.as + this.j[13][this.az]);
                    }
                    else {
                        this.a(this.b[7][this.az] + this.ax, this.ar + this.j[12][this.az], this.as + this.j[13][this.az]);
                    }
                    this.an = -1;
                }
            }
            ++this.aB;
        }
    }
    
    private boolean a() {
        if (this.ay == 10 && !this.s && this.v == 1 && this.at > -1) {
            if ((this.e[909 + this.aq] != 0 && this.e[909 + this.aq] == this.F) || (this.F == -1 && this.k == this.aq)) {
                this.a(599, this.ar + this.j[12][this.az], this.as + this.j[13][this.az]);
            }
            else if (this.W == this.aq) {
                this.ax = 1;
                if (this.W >= 51) {
                    this.ax = 3;
                }
            }
            this.aC = 0;
            for (int i = this.C + 1; i <= this.C + this.E; ++i) {
                for (int j = this.B + 1; j <= this.B + this.D; ++j) {
                    final byte b;
                    if ((b = this.c[i][j]) >= 1 && b <= 50 && this.e[1919 + b] > 0) {
                        ++this.aC;
                        if (b == this.aq) {
                            this.ax = 1;
                        }
                    }
                }
            }
        }
        return true;
    }
    
    private boolean b() {
        if (this.ay == 0) {
            this.ap = this.az;
            this.ax = 0;
            this.ax = (this.e[5151 + this.aq] >> 2 & 0x3);
            if (this.ax > 1) {
                this.ax -= 2;
                this.an = 0;
            }
            this.ax *= 72;
            if (this.aq >= 51) {
                this.ax += 36;
            }
            this.ax += this.e[1515 + this.aq] * 18;
        }
        else if (this.ay == 9) {
            this.ao = this.az;
            this.ax = 0;
            this.ax = (this.e[5151 + this.aq] & 0x3);
            if (this.aq >= 51) {
                this.an = 3;
            }
            else if (this.ax > 0) {
                this.an = this.ax;
            }
            this.ax = ((this.e[1515 + this.aq] == 1) ? 1 : ((this.e[1414 + this.aq] < 30) ? 3 : ((this.e[1414 + this.aq] < 50) ? 2 : 0)));
            this.ax *= 12;
        }
        else if (this.ay == 7) {
            if (this.aq == this.a[0][17]) {
                this.ax += 2;
            }
            else {
                if (this.a[this.a[42] + this.a[this.a[41] + this.e[6464 + this.aq]]] == 0) {
                    return false;
                }
                this.ax += this.a[this.a[42] + this.a[this.a[41] + this.e[6464 + this.aq]]] - 1;
            }
        }
        else if (this.aw == 0 && this.ay >= 5 && this.ay <= 8) {
            if (this.at < 0 && this.e[6565 + this.aq] == 1) {
                return false;
            }
            if ((this.ay == 5 && this.e[6565 + this.aq] == 4) || (this.ay == 6 && this.e[6565 + this.aq] == 5)) {
                this.ax = 1;
            }
            else if (this.a[this.a[145] + this.e[6565 + this.aq]] != this.ay) {
                return false;
            }
        }
        else if (this.aw == 2) {
            if (this.e[3535 + this.aq] != 0) {
                if (this.ay == 4 && (this.e[3636 + this.aq] > 0 || this.av == 113 || this.av == 114 || this.av == 115 || this.av == 116)) {
                    this.ax += this.e[3535 + this.aq];
                }
                else if (this.ay == 5) {
                    if (this.e[6565 + this.aq] == 9) {
                        return false;
                    }
                    this.ax += this.e[6565 + this.aq];
                }
                else if (this.ay == 8) {
                    return false;
                }
            }
            else if (this.e[3535 + this.aq] == 0) {
                if (this.ay == 4) {
                    return false;
                }
                if (this.ay == 5) {
                    if (this.e[6565 + this.aq] == 1) {
                        return false;
                    }
                    if (this.e[6565 + this.aq] == 9) {
                        return false;
                    }
                    this.ax += this.e[6565 + this.aq];
                }
                else if (this.ay == 8 && this.e[6565 + this.aq] != 1) {
                    return false;
                }
            }
        }
        else if (this.aw == 1 && this.ay == 5) {
            if (this.e[6565 + this.aq] == 9) {
                return false;
            }
            this.ax += this.e[6565 + this.aq];
        }
        return true;
    }
    
    private void q() {
        if (!this.s && this.ao >= 0 && this.ap >= 0 && this.v == 1) {
            this.a.a((this.Y == 29) ? this.aq : (101 + this.aq), this.ar + this.j[12][this.ao] + 4, this.as + this.j[13][this.ao]);
            if (this.Y == 29 && this.at > -1) {
                for (int i = 0; i < 30; ++i) {
                    if (this.b[0][2][i] == this.aq && this.b[0][1][i] != 3) {
                        this.d(65 + (1 - this.b[0][4][i]) * 5 + this.b[0][1][i], this.ar + this.j[12][this.ap], this.as + this.j[13][this.ap], this.f);
                        break;
                    }
                }
                if (this.e[4646 + this.aq] == 1 && this.e[2828 + this.aq] == 51 && this.e[1313 + this.aq] > 0) {
                    this.d(65, this.ar + this.j[12][this.ap], this.as + this.j[13][this.ap], this.f);
                }
                if (this.e[3333 + this.aq] > -1) {
                    this.d(77 + this.e[3333 + this.aq], this.ar + this.j[12][this.ao], this.as + this.j[13][this.ao], (this.c - (this.aq & 0x7)) % 15);
                }
                if (this.e[4646 + this.aq] < -1) {
                    this.d(-this.e[4646 + this.aq], this.ar + this.j[12][this.ap], this.as + this.j[13][this.ap], this.e[3030 + this.aq]);
                }
                if ((this.e[7979 + this.aq] & 0x4) == 0x4) {
                    this.d(73, this.ar + this.j[12][this.ao], this.as + this.j[13][this.ao], this.f + this.aq);
                }
                if ((this.e[7979 + this.aq] & 0x8) == 0x8) {
                    this.d(69, this.ar + this.j[12][this.ap], this.as + this.j[13][this.ap], this.f);
                }
                if (this.aq <= 50) {
                    if (this.aq == 0 || (this.aq == 1 && (this.aq == this.k || this.aq == this.W || this.e[909 + this.aq] == this.F || this.aq == this.c[this.K + this.A][this.I + this.y] || (this.X != 0 && -this.c[this.K + this.A][this.I + this.y] == this.e[4444 + this.aq])))) {
                        this.a(577 + this.e[2222 + this.aq], this.ar + this.j[12][this.ao], this.as + this.j[13][this.ao]);
                    }
                    if (!this.F && this.e[1919 + this.aq] > 0 && (this.aq == this.k || this.aq == this.W || this.e[909 + this.aq] == this.F || this.aq == this.c[this.K + this.A][this.I + this.y] || this.e[6767 + this.aq] / 3 * 2 > this.e[1919 + this.aq] || (this.X != 0 && -this.c[this.K + this.A][this.I + this.y] == this.e[4444 + this.aq]))) {
                        final int n = this.e[6767 + this.aq] / 20;
                        int n2 = 0;
                        if (this.e[1616 + this.aq] >= 5 || this.e[1717 + this.aq] >= 5 || this.e[7575 + this.aq] > 5) {
                            n2 = 2;
                            this.a(602 + ((this.e[1616 + this.aq] > this.e[1717 + this.aq]) ? ((this.e[1616 + this.aq] > this.e[7575 + this.aq]) ? this.e[1616 + this.aq] : ((this.e[1717 + this.aq] >= this.e[7575 + this.aq]) ? this.e[1717 + this.aq] : (this.e[7575 + this.aq] - 1))) : ((this.e[1717 + this.aq] >= this.e[7575 + this.aq]) ? this.e[1717 + this.aq] : (this.e[7575 + this.aq] - 1))) - 5, this.ar + this.j[12][this.ao] + 2 - n + 2 - 10, this.as + this.j[13][this.ao]);
                        }
                        this.a(607 + n, this.ar + this.j[12][this.ao] + n2, this.as + this.j[13][this.ao]);
                        f.a[this.N].setColor(this.e[(this.e[1919 + this.aq] - 1) * 3 / this.e[6767 + this.aq]]);
                        a(f.a[this.N], this.ar + this.j[12][this.ao] + 2 - n + n2, this.as + this.j[13][this.ao] - 4, this.a[this.a[128] + n] * this.e[1919 + this.aq] / this.e[6767 + this.aq], 2);
                    }
                }
                if ((this.F || this.V) && this.aq == this.l) {
                    this.d(41, this.ar + this.j[12][this.ap] - 1, this.as + this.j[13][this.ap] - 16 - 5, this.e);
                }
            }
        }
    }
    
    final void a(final int n, final int n2, final int n3, final int n4) {
        for (int i = 0; i < 40; ++i) {
            if (this.d[0][i] == 0) {
                this.d[1][i] = 0;
                this.d[0][i] = (byte)n4;
                this.d[2][i] = (byte)n3;
                this.d[6][i] = (byte)n2;
                this.d[5][i] = (byte)n;
                return;
            }
        }
    }
    
    private void r() {
        this.aq = -1;
        try {
            for (int i = 0; i < 40; ++i) {
                if (this.d[0][i] > 0) {
                    int n = 29;
                    this.aq = this.d[5][i];
                    int n2;
                    int n3;
                    if (this.d[6][i] == 1) {
                        n2 = this.e[0 + this.aq];
                        n3 = this.e[101 + this.aq];
                    }
                    else if (this.d[6][i] == 2) {
                        n2 = this.e[9359 + this.aq];
                        n3 = this.e[9381 + this.aq];
                        n = 108;
                        this.d[2][i] = 0;
                    }
                    else {
                        n2 = this.e[8383 + this.aq] + (this.d[2][i] & 0xF);
                        n3 = this.e[8444 + this.aq] + (this.d[2][i] >> 4 & 0xF);
                    }
                    if (!this.a(n2, n3) || this.a(n2, n3) != 0 || (this.e[1919 + this.aq] <= 0 && this.d[6][i] == 1)) {
                        this.d[0][i] = 0;
                        return;
                    }
                    int n4 = (n2 - this.I) * 22;
                    int n5 = (n3 - this.K) * 16;
                    if (this.d[6][i] == 1 || this.d[6][i] == 2) {
                        final int n6 = (this.b[2][this.e[this.b[n] + this.aq] & 0xFF] & 0xFFF) + this.a[this.a[99] + (this.b[3][this.e[this.b[n] + this.aq] & 0xFF] >> 14 & 0x3) * 8 + this.e[606 + this.aq]] * this.j[4][this.e[this.b[n] + this.aq] & 0xFF] + this.e[this.b[n + 1] + this.aq];
                        final short n7 = this.b[4][n6];
                        int n8 = 0;
                        final short n9 = this.b[8][this.b[4][n6]];
                        for (short n10 = 0; n10 < this.j[15][n7]; ++n10) {
                            n8 = n9 + n10;
                            if ((this.j[14][n8] & 0xF) == this.d[2][i]) {
                                break;
                            }
                        }
                        if (this.d[6][i] == 1) {
                            n4 += this.e[202 + this.aq] + this.j[12][n8];
                            n5 += this.e[303 + this.aq] + this.j[13][n8];
                        }
                        else if (this.d[6][i] == 2) {
                            n4 += this.e[9403 + this.aq] + this.j[12][n8];
                            n5 += this.e[9425 + this.aq] + this.j[13][n8];
                        }
                    }
                    this.d(this.d[0][i], n4, n5, this.d[1][i]);
                    final byte[] array = this.d[1];
                    final int n11 = i;
                    ++array[n11];
                    if (this.d[1][i] >= this.j[9][this.d[0][i]]) {
                        this.d[0][i] = 0;
                    }
                }
            }
        }
        catch (final Exception ex) {}
    }
    
    final void a(final int n, final int n2) {
        for (int i = 0; i < 30; ++i) {
            if (this.e[0][i] == 0) {
                this.e[1][i] = 0;
                this.e[2][i] = (byte)n2;
                this.e[0][i] = (byte)n;
                return;
            }
        }
    }
    
    private void s() {
        for (int i = 0; i < 30; ++i) {
            if (this.e[0][i] != 0) {
                final byte b = this.e[0][i];
                final byte b2 = this.e[8383 + b];
                final int n = this.e[8444 + b] - 1;
                final byte b3 = this.a[this.a[138] + 104 + this.e[8749 + b]];
                final byte b4 = this.a[this.a[138] + 130 + this.e[8749 + b]];
                if (this.e[1][i] >= 20) {
                    this.e[0][i] = 0;
                    if (this.e[2][i] == 3) {
                        this.c(b, false);
                        this.e[8627 + b] = 3;
                    }
                    this.c(b2, n + 1, b3, b4);
                    this.d((int)b);
                }
                else {
                    for (int j = 0; j < b4 + 1; j += 2) {
                        for (byte b5 = 0; b5 < b3; b5 += 2) {
                            if (this.a(b2 + b5, n + j)) {
                                this.d(74, (b2 + b5 - this.I) * 22, (n + j - this.K) * 16, (b5 * 2 + j) * 2 + this.e[1][i] - 1);
                            }
                        }
                    }
                }
                final byte[] array = this.e[1];
                final int n2 = i;
                ++array[n2];
            }
        }
    }
    
    private boolean a(final int n, final int n2) {
        return n >= this.I && n < this.I + this.O && n2 >= this.K && n2 < this.K + this.P;
    }
    
    private void t() {
        for (int i = 0; i < 40; i = (byte)(i + 1)) {
            this.d[0][i] = 0;
        }
    }
    
    private void d(final int n, final int n2, final int n3, final int n4) {
        final int n5 = this.b[5][n] + n4 % this.j[9][n];
        this.a(this.b[6][n5], n2 + this.j[10][n5], n3 + this.j[11][n5]);
    }
    
    final void a(final int n, final int n2, final int n3) {
        final int n4 = this.b[9][n] & 0x1FFF;
        final int n5;
        if ((n5 = ((this.b[9][n] & 0xFFFF) >> 14 & 0x3)) != 0) {
            this.b((n5 - 1) * 3 + 1, n2, n3);
        }
        for (int i = n4; i < n4 + (this.j[16][n] & 0x3F); ++i) {
            final int n6 = this.b[10][i] & 0x1FFF;
            final int n7 = (this.b[10][i] & 0xC000) >> 14 << 7;
            if ((this.b[10][i] & 0x2000) >> 13 == 0) {
                this.b(n6, n2 + this.j[18][i] + n7, n3 + this.j[19][i]);
            }
            else {
                this.a(n6, n2 + this.j[18][i] + n7, n3 + this.j[19][i]);
            }
        }
    }
    
    private void b(final int n, int n2, int n3) {
        if (n == 0) {
            return;
        }
        int n4 = this.j[20][n] & 0x1F;
        n2 += 11;
        n3 += 8;
        if (n4 < 27) {
            boolean b = false;
            if (this.an > -1) {
                if (this.an == 0) {
                    if (n4 == 5) {
                        n4 = this.an;
                        b = true;
                    }
                }
                else if (this.an == 4) {
                    if (n4 == 14) {
                        n4 = 4;
                        b = true;
                    }
                    else if (n4 == 15) {
                        n4 = 5;
                        b = true;
                    }
                }
                else if (n4 == 9) {
                    n4 = this.an;
                    b = true;
                }
            }
            if (b) {
                if (!a(f.a[this.N], this.a[1][n4], this.j[21][n] & 0x7F, this.j[22][n], this.j[23][n], this.j[24][n], n2, n3, 20)) {
                    return;
                }
            }
            else {
                a(f.a[this.N], this.a[0][n4], this.j[21][n] & 0x7F, this.j[22][n], this.j[23][n], this.j[24][n], n2, n3, 20);
            }
            return;
        }
        final int n5 = (this.j[20][n] & 0xFF) >> 5 | (this.j[21][n] & 0x80) >> 4;
        f.a[this.N].setColor(this.j[17][n5 * 3 + 0] & 0xFF, this.j[17][n5 * 3 + 1] & 0xFF, this.j[17][n5 * 3 + 2] & 0xFF);
        if (n4 == 27) {
            d(f.a[this.N], n2 + (this.j[21][n] & 0x7F), n3 + this.j[22][n], n2 + this.j[23][n], n3 + this.j[24][n]);
            return;
        }
        if (n4 == 28) {
            b(f.a[this.N], n2 + (this.j[21][n] & 0x7F), n3 + this.j[22][n], this.j[23][n], this.j[24][n]);
            return;
        }
        if (n4 == 29) {
            a(f.a[this.N], n2 + (this.j[21][n] & 0x7F) - 11, n3 + this.j[22][n] - 8, this.j[23][n], this.j[24][n]);
            return;
        }
        if (n4 == 30) {
            a(f.a[this.N], n2 + (this.j[21][n] & 0x7F) * 4 - 11, n3 + this.j[22][n] * 4 - 8, this.j[23][n] * 4, this.j[24][n] * 4);
        }
    }
    
    private void a(final Graphics graphics, final int n, final int n2, final int n3) {
        int i = 0;
        while (i < (i = (this.b[9][n] & 0x1FFF)) + (this.j[16][n] & 0x3F)) {
            final int n4 = this.b[10][i] & 0x1FFF;
            final int n5 = (this.b[10][i] & 0xC000) >> 14 << 7;
            if ((this.b[10][i] & 0x2000) >> 13 == 0) {
                this.b(graphics, n4, n2 + this.j[18][i] + n5, n3 + this.j[19][i]);
            }
            else {
                this.a(graphics, n4, n2 + this.j[18][i] + n5, n3 + this.j[19][i]);
            }
            ++i;
        }
    }
    
    private void b(final Graphics graphics, final int n, final int n2, final int n3) {
        if (n == 0) {
            return;
        }
        final int n4 = this.j[20][n] & 0x1F;
        try {
            if (n4 == 27) {
                graphics.setColor(0);
                d(graphics, n2 + (this.j[21][n] & 0x7F), n3 + this.j[22][n], n2 + this.j[23][n], n3 + this.j[24][n]);
            }
            else if (n4 == 28) {
                graphics.setColor(0);
                b(graphics, n2 + (this.j[21][n] & 0x7F), n3 + this.j[22][n], this.j[23][n], this.j[24][n]);
            }
            else if (n4 == 29) {
                graphics.setColor(0);
                a(graphics, n2 + (this.j[21][n] & 0x7F) - 11, n3 + this.j[22][n] - 8, this.j[23][n], this.j[24][n]);
            }
            else {
                if (n4 != 30) {
                    a(graphics, this.a[0][n4], this.j[21][n] & 0x7F, this.j[22][n], this.j[23][n], this.j[24][n], n2, n3, 20);
                    return;
                }
                graphics.setColor(0);
                a(graphics, n2 + (this.j[21][n] & 0x7F) * 4 - 11, n3 + this.j[22][n] * 4 - 8, this.j[23][n] * 4, this.j[24][n] * 4);
            }
        }
        catch (final Exception ex) {}
    }
    
    private void i(int n) {
        int n2 = 1;
        try {
            do {
                if (n2 == 0) {
                    n = this.e[6060 + n];
                }
                n2 = 0;
                final byte b = this.e[7676 + n];
                final int n3 = 0 + (this.e[5252 + n] - this.I) * 22 + 11 + this.e[5454 + n];
                final int n4 = 0 + (this.e[5353 + n] - this.K) * 16 + 8 + this.e[5555 + n] - this.h[this.e[5858 + n]][n] - 10;
                final byte b2;
                if ((b2 = this.e[6565 + n]) == 1 || b2 == 2 || b2 == 5) {
                    this.a(292 + this.a[this.a[190 + this.a[this.a[77] + b2]] + b * this.a[this.a[193] + 6 + b2] + this.i[this.e[5858 + n]][n]] + this.a[this.a[193] + b2], n3, n4);
                }
            } while (this.e[6060 + n] != 0);
        }
        catch (final Exception ex) {}
    }
    
    private void u() {
        byte b = -16;
        try {
            this.v();
            this.ai = -1;
            while (this.ai < this.P + 3) {
                final int n;
                if ((n = this.ai + this.K) < this.d) {
                    this.ah = this.O - 1 + 1;
                    while (this.ah >= -1) {
                        int n2 = this.ah + this.I;
                        if (n >= 0 && n < this.d && n2 >= 0) {
                            if (n2 < this.c) {
                                final int n3 = this.ah * 22;
                                byte a = this.a(n2, n);
                                if (this.s && !this.J) {
                                    a = 0;
                                }
                                final byte b2 = this.c[n][n2];
                                final int n4 = this.b[n][n2] & 0xFF;
                                if (b2 != 0) {
                                    if (a < 2 && ((n4 >= 180 && n4 <= 231) || n4 == 243)) {
                                        this.a(n4, (byte)1);
                                    }
                                    else if (a < 1 && b2 >= 1 && b2 <= 100 && (!this.s || this.ao != 9)) {
                                        if (c((int)this.e[4545 + b2]) != 2) {
                                            this.a((int)this.e[4545 + b2], (byte)1);
                                        }
                                        if (c((int)this.e[4545 + b2]) == 2 || this.e[2929 + b2] <= 14) {
                                            if (this.ai >= 0 && this.ah - 1 >= 0 && this.e[9833 + (this.c[n][n2 - 1] + 61) * -1] == 5 && c((int)this.c[n][n2 - 1])) {
                                                if (this.ah < this.O) {
                                                    this.g[this.ai][this.ah] = 0;
                                                }
                                                --this.ah;
                                                n2 = this.ah + this.I;
                                                this.a((int)this.c[n][n2], (byte)1);
                                            }
                                            if (a((int)b2) == 0 || (this.e[7979 + b2] & 0x2) == 0x0) {
                                                this.a(b2, n3 + this.e[202 + b2], b + this.e[303 + b2], this.e[606 + b2], (byte)29);
                                            }
                                        }
                                    }
                                    else if (b2 <= -1 && b2 >= -60 && (a < 2 || this.e[9176 + -b2] > 0)) {
                                        if ((this.e[9176 + -b2] & 0x4) != 0x0) {
                                            switch (a) {
                                                case 0: {
                                                    this.e[9176 + -b2] = 6;
                                                    break;
                                                }
                                                case 1: {
                                                    this.e[9176 + -b2] = 5;
                                                    break;
                                                }
                                            }
                                        }
                                        switch (this.e[9176 + -b2] & 0x3) {
                                            case 1: {
                                                a = 1;
                                                break;
                                            }
                                            case 2: {
                                                a = 0;
                                                break;
                                            }
                                        }
                                        if ((this.e[8871 + -b2] & 0x1) == 0x0) {
                                            this.a((int)b2, (byte)1);
                                            final byte[] e = this.e;
                                            final int n5 = 8871 + -b2;
                                            e[n5] |= 0x1;
                                            final byte b3 = this.e[8749 + -b2];
                                            final byte b4 = this.a[this.a[138] + 104 + b3];
                                            final byte b5 = this.a[this.a[138] + 130 + b3];
                                            if ((this.e[9176 + -b2] & 0x4) == 0x0) {
                                                this.a.S = 0;
                                                this.a.a((int)this.e[8383 + -b2], (int)this.e[8444 + -b2], (int)b4, (int)b5);
                                                this.a.S = 1;
                                                this.e[9176 + -b2] = 4;
                                            }
                                            if (!this.s && b3 < 22) {
                                                if ((this.a[this.a[138] + 156 + b3] != -1 || this.e[8627 + -b2] == 1 || this.e[8627 + -b2] == 2) && this.e[8810 + -b2] == 0 && b((int)b2) == 0) {
                                                    this.d(40, (this.e[8383 + -b2] - this.I) * 22 + b4 * 11 - 11, (this.e[8444 + -b2] - this.K) * 16 + b5 * 8 - 8, this.e);
                                                }
                                                if (((this.e[8505 + -b2] > 0 && (b2 == this.c[this.K + this.A][this.I + this.y] || this.e[8566 + -b2] / 2 > this.e[8505 + -b2])) || this.e[8627 + -b2] == 1 || this.e[8627 + -b2] == 2 || b3 >= 12) && b((int)b2) == 0) {
                                                    final int n6 = this.e[8566 + -b2] / 80 + 6;
                                                    final int n7 = (this.e[8383 + -b2] - this.I) * 22 + b4 * 11 - 11;
                                                    int n8 = b - this.a[this.a[138] + 520 + b3] * 8 - 5;
                                                    this.a(607 + n6, n7, n8);
                                                    f.a[this.N].setColor(this.e[(this.e[8505 + -b2] - 1) * 3 / this.e[8566 + -b2]]);
                                                    a(f.a[this.N], n7 + 1, n8 + 1, this.a[this.a[128] + n6] * this.e[8505 + -b2] / this.e[8566 + -b2], 2);
                                                    if (b2 == this.c[this.K + this.A][this.I + this.y]) {
                                                        final byte a2;
                                                        final int n9 = (a2 = this.a.a(-b2)) >> 4 & 0xF;
                                                        final int n10 = a2 & 0xF;
                                                        final int n11;
                                                        if ((n11 = n9 + n10) > 0) {
                                                            final int n12 = n7 + 1 + this.a[this.a[128] + n6] / 2 - 4 * n11 / 2 + 1;
                                                            n8 += 6;
                                                            f.a[this.N].setColor(0);
                                                            a(f.a[this.N], n12 - 0, n8 - 1, n11 * 4 - 1, 4);
                                                            a(f.a[this.N], n12 - 1, n8 - 0, n11 * 4 + 1, 2);
                                                            for (int i = 0; i < n11; i = (byte)(i + 1)) {
                                                                f.a[this.N].setColor((i < n10) ? 16164864 : 4207389);
                                                                a(f.a[this.N], n12 + i * 4, n8, 3, 2);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else if (a < 1 && b((int)b2)) {
                                        final int n13 = b2 - 101;
                                        this.a(n13, n3 + this.e[9403 + n13], b + this.e[9425 + n13], this.e[9491 + n13], (byte)108);
                                    }
                                    else if (a < 2 && (c((int)b2) || c((int)b2) == 3)) {
                                        this.a((int)b2, (byte)1);
                                    }
                                    else if (a == 0 && b2 <= -114 && b2 > -117) {
                                        if (this.h >= 94 + n && this.h <= 100 + n) {
                                            this.d(75, n3, b, this.h - (100 + n) + 6);
                                        }
                                        else if ((this.h + this.ah + this.ai) % 10 < 5) {
                                            this.a(this.b[n][n2] & 0xFF, n3, b);
                                        }
                                    }
                                }
                                if (this.ah >= 0 && this.ah < this.O && this.ai >= 0 && this.g[this.ai][this.ah] > 0) {
                                    this.i(this.g[this.ai][this.ah]);
                                    this.g[this.ai][this.ah] = 0;
                                }
                                if (a == 1) {
                                    this.b(12, n3 - 2, b - 4);
                                }
                                else if (a == 2) {
                                    f.a[this.c[1]].setColor(0);
                                    if (n2 == 0 || n2 == this.c - 1 || n == 0 || n == this.d - 1 || this.a(n2 - 1, n) != 2 || this.a(n2 + 1, n) != 2 || this.a(n2, n - 1) != 2 || this.a(n2, n + 1) != 2) {
                                        this.b(11, n3 - 3, b - 2);
                                    }
                                    else {
                                        a(f.a[this.c[1]], n3, b, 22, 16);
                                    }
                                }
                                if (this.ai == this.A && this.ah == this.y) {
                                    this.Z = a;
                                }
                            }
                        }
                        --this.ah;
                    }
                    if ((this.L || this.N) && this.q[1] - this.K == this.ai) {
                        this.d(105, (this.q[0] - this.I) * 22, b, this.f);
                    }
                    b += 16;
                }
                ++this.ai;
            }
            this.r();
            this.s();
            if (this.ad == 0 && this.ae == 0) {
                if (this.N) {
                    this.d(30, 218, 11, this.f);
                    return;
                }
                if (this.L) {
                    this.d(31, 218, 11, this.f);
                }
            }
        }
        catch (final Exception ex) {}
    }
    
    private void v() {
        for (int i = 1; i <= 60; ++i) {
            final byte[] e = this.e;
            final int n = 8871 + i;
            e[n] &= (byte)254;
            if (this.e[9176 + i] > 0) {
                this.e[9176 + i] = 5;
            }
        }
        int n2 = 0;
        for (int j = 0; j < 5; ++j) {
            if (this.c[n2][j][2] >= 0 && this.c[n2][j][3] == 1 && this.c[n2][j][0] >= this.I - 1 && this.c[n2][j][0] <= this.I + this.O + 1 && this.c[n2][j][1] >= this.K - 1 && this.c[n2][j][1] <= this.K + this.P + 1) {
                for (int k = 0; k < 9; ++k) {
                    if (this.a(this.c[n2][j][0] + this.a[this.a[141] + 0 + k], this.c[n2][j][1] + this.a[this.a[141] + 9 + k]) == 0) {
                        this.d(68, (this.c[n2][j][0] - this.I + this.a[this.a[141] + 0 + k]) * 22, (this.c[n2][j][1] - this.K + this.a[this.a[141] + 9 + k]) * 16, this.f);
                    }
                }
            }
            if (j == 4 && n2 == 0) {
                j = 0;
                n2 = 1;
            }
        }
        for (int l = 0; l < 30; ++l) {
            final byte b = this.b[0][2][l];
            final byte b2 = this.b[0][3][l];
            if (this.b[0][1][l] == 3 && this.b[0][0][l] != 0 && b >= this.I - 1 && b <= this.I + this.O + 1 && b2 >= this.K - 1 && b2 <= this.K + this.P + 1 && this.a((int)b, (int)b2) == 0) {
                this.d(68 + (1 - this.b[0][4][l]) * 5, (b - this.I - 0) * 22, (b2 - this.K - 0) * 16, this.f);
            }
        }
    }
    
    private void w() {
        if (this.u) {
            this.Q = ((this.G - this.I <= this.y) ? (this.G - this.I) : this.y);
            this.B = this.Q + this.I - 1;
            this.R = ((this.H - this.K <= this.A) ? (this.H - this.K) : this.A);
            this.C = this.R + this.K - 1;
            this.Q *= 22;
            this.R *= 16;
            int n = this.I + this.y - this.G;
            int n2 = this.K + this.A - this.H;
            if (n < 0) {
                n *= -1;
            }
            this.D = n + 1;
            if (n2 < 0) {
                n2 *= -1;
            }
            this.E = n2 + 1;
            final int n3 = (n + 1) * 22;
            final int n4 = (n2 + 1) * 16;
            f.a[this.c[1]].setColor(0);
            b(f.a[this.c[1]], 11 + this.Q + 1, 8 + this.R + 1, n3, n4);
            f.a[this.c[1]].setColor(1105252);
            b(f.a[this.c[1]], 11 + this.Q, 8 + this.R, n3, n4);
        }
        final byte b;
        if (b((int)(b = this.c[this.K + this.A][this.I + this.y])) == 0) {
            final int n5 = (this.e[8383 + -b] - this.I) * 22;
            final int n6 = (this.e[8444 + -b] - this.K) * 16;
            final int n7 = this.a[this.a[138] + 104 + this.e[8749 + -b]] * 22;
            final int n8 = this.a[this.a[138] + 130 + this.e[8749 + -b]] * 16;
            this.d(6, n5, n6, this.e);
            this.d(7, n5 + n7, n6, this.e);
            this.d(8, n5, n6 + n8, this.e);
            this.d(9, n5 + n7, n6 + n8, this.e);
        }
    }
    
    private void c(final int n, final int n2) {
        if (this.aa != 0) {
            this.d(34 + this.aa, (this.ab - this.I) * 22, (this.ac - this.K) * 16, this.e);
            if (this.e == 5) {
                this.aa = 0;
            }
        }
        final byte b = this.c[this.K + this.A][this.I + this.y];
        if (this.w != 2) {
            int i = -1;
            int n3 = 32;
            if (this.w == 1) {
                if (this.k != 0) {
                    i = 1;
                }
                else if (this.F != -1) {
                    i = 0;
                    for (int j = 0; j < 50; ++j) {
                        if (this.a[this.F][j] != 0) {
                            i = (byte)(i + 1);
                        }
                    }
                }
                n3 = ((this.Z == 0 && (b((int)b) == 1 || b((int)b) || (a((int)b) == 1 && (this.e[7979 + b] & 0x2) == 0x0))) ? 34 : 33);
            }
            else if (this.w == 3) {
                int n4;
                if (this.s == 100) {
                    this.r = true;
                    n4 = 105;
                }
                else if (this.s < 0 || this.s <= 3) {
                    if ((a((int)b) == 0 && this.e[1414 + b] >= 12) || (a((int)this.W) == 0 && this.e[1414 + this.W] >= 12)) {
                        this.r = this.W;
                        this.t = this.e[0 + this.r];
                        this.u = this.e[101 + this.r];
                        this.r = true;
                        n4 = 33;
                    }
                    else if (this.s == 3) {
                        this.r = true;
                        n4 = 33;
                    }
                    else {
                        this.r = false;
                        n4 = 32;
                    }
                }
                else {
                    final byte b2 = this.a[this.a[138] + 104 + this.s];
                    final byte b3 = this.a[this.a[138] + 130 + this.s];
                    this.t = this.y - b2 / 2;
                    this.u = this.A - b3 / 2;
                    this.S = n - b2 / 2 * 22;
                    this.T = n2 - b3 / 2 * 16 - 5 + this.e;
                    this.a(1000 + this.s + 1, (byte)2);
                    this.r = this.a(this.s, this.I + this.t, this.K + this.u, true);
                    n4 = (this.r ? 41 : 40);
                }
                n3 = n4;
            }
            if (this.E && this.e < 2 && n3 <= 34) {
                n3 = (byte)(n3 + 5);
            }
            this.d(n3, n, n2, this.e);
            if (i > 0) {
                this.a.a(n + 22, n2 + 8, 0, "" + i, 1);
                this.a.a(f.a[this.N]);
            }
            if (this.aC > 0) {
                this.a.a(n + 22, n2 + 8, 0, "" + this.aC, 1);
                this.a.a(f.a[this.N]);
            }
            if (this.w == 3) {
                if (this.s < 0) {
                    this.a(659 - this.s - 1, n + 11 + 5, n2 + 8 + 5);
                }
                else if (this.s <= 3) {
                    this.d(this.s + 48, n, n2, this.e);
                }
            }
        }
        int n5 = 0;
        if (this.w == 1) {
            if (this.q && this.aa != 0) {
                n5 = 47;
                this.Z = 0;
            }
            else if (b == -124) {
                n5 = 44;
            }
            else if (b == -125) {
                n5 = 45;
            }
            else if (b((int)b) == 0 && this.e[8749 + -b] != 10) {
                n5 = 41;
            }
            else if (c((int)b)) {
                n5 = ((this.e[9833 + (b + 61) * -1] == 7) ? 46 : 43);
            }
            else if (b((int)b) && this.Z == 0) {
                n5 = 43;
            }
            if (n5 != 0 && this.Z != 2) {
                this.d(n5, n, n2, this.e);
            }
        }
    }
    
    private void a(final byte ad, final int n, final int n2) {
        this.aD = ad;
        try {
            final boolean c = this.c();
            if (this.b[ad]) {
                this.b[17] = true;
                this.ae = 0;
            }
            else if (c) {
                this.ae = 1;
            }
            else {
                if (this.a[this.a[195] + 80 + ad] != 1) {
                    return;
                }
                this.ae = 2;
            }
            this.N = this.c[this.a[this.a[195] + 0 + ad]];
            this.aE = this.a[this.a[195] + 60 + ad];
            final byte b = this.a[this.a[195] + 40 + ad];
            int n3 = 0;
            for (int i = this.b[0][b]; i < this.b[0][b] + this.j[0][b]; ++i) {
                final int n4 = (this.j[3][i] & 0xFF) >> 6;
                final int n5 = this.j[3][i] & 0x7;
                this.aI = (this.b[1][i] & 0xFFF);
                if (n4 < this.ae && n3 == 0) {
                    if (n4 == 1) {
                        n3 = 1;
                    }
                }
                else {
                    this.aF = 0;
                    if (n3 != 0) {
                        n3 = 0;
                        if ((this.k[this.aE] == 0 && this.ae > 0) || this.k[this.aE] < 0) {
                            ++this.aE;
                            continue;
                        }
                        this.aF = this.d[this.aE];
                        this.k[this.aE] = 0;
                        ++this.aE;
                    }
                    else if (n4 == 1) {
                        n3 = 1;
                        if ((this.k[this.aE] == 0 && this.ae > 0) || this.aI == 0 || n4 < this.ae) {
                            continue;
                        }
                        if (this.k[this.aE] < 0) {
                            continue;
                        }
                    }
                    else if (n4 == 2 && this.k[this.aE] < 0) {
                        continue;
                    }
                    final int n6 = (this.b[1][i] >> 14 & 0x3) << 7;
                    final int n7 = (this.b[1][i] >> 12 & 0x3) << 7;
                    this.aJ = this.j[1][i];
                    this.aK = this.j[2][i];
                    if (ad >= 13 && ad <= 16) {
                        this.aJ += 120;
                        this.aK += 110;
                    }
                    else {
                        this.aJ += n;
                        this.aK += n2;
                    }
                    this.aJ += n6;
                    this.aK += n7;
                    if (i == 1011) {
                        this.aI = (this.b[1][1007] & 0xFFF);
                        this.aF = this.d[3];
                        this.d(n5, 1007);
                        this.aI = 0;
                    }
                    if (i == 1010) {
                        this.a(i, this.ae, this.aK);
                    }
                    else if (i == 1137) {
                        this.c(i, this.aJ, this.aK);
                    }
                    else if (n5 == 0 && (this.j[3][i] & 0xFF) >> 6 == 3) {
                        f.a[this.N].setColor(0);
                        int n8 = 99;
                        if (i == 1030) {
                            n8 = this.e[6767 + this.l];
                        }
                        if (this.aF >= 0) {
                            final int n9 = this.j[23][this.aI] * this.aF / n8;
                            a(f.a[this.N], this.j[1][i] + n9 + 1, this.aK, this.j[23][this.aI] - n9 + n7, 4);
                        }
                    }
                    else if (n5 == 3 && this.aI >= 3 && this.aI <= 4) {
                        if (this.v != -1) {
                            if (this.b[ad] || this.v != this.w) {
                                this.a.b(this.aG, this.aH, this.j[23][this.b[1][i - 1] & 0xFFF] * 4, this.j[24][this.b[1][i - 1] & 0xFFF] * 4, this.v, (this.j[3][i] & 0xFF) >> 6, this.aI - 3);
                            }
                            if (this.w != this.v) {
                                this.w = this.v;
                                this.y = 0;
                            }
                            this.z = this.y;
                            this.a.a(f.a[this.N], this.y);
                        }
                    }
                    else if (this.aI != 0) {
                        this.d(n5, i);
                    }
                }
            }
            this.a.a(f.a[this.N]);
            this.b[ad] = false;
        }
        catch (final Exception ex) {}
    }
    
    private void d(final int n, final int n2) {
        if (n == 0) {
            this.b(this.aI, this.aJ, this.aK);
            this.aG = this.aJ;
            this.aH = this.aK;
            return;
        }
        if (n == 1) {
            this.j(n2);
            return;
        }
        if (n == 2) {
            if ((this.Q && (this.aI == 4 || this.aI == 94)) || (this.R && (this.aI == 5 || this.aI == 95)) || (!this.T && this.aI == 1) || (!this.U && this.aI == 2)) {
                return;
            }
            if (n2 - 1 == 1201) {
                f.a[f.M].setColor(1105252);
                b(f.a[f.M], 11 + this.aJ + (this.I - this.W) * 5, 8 + this.aK + (this.K - this.X + this.aL) * 4, this.O * 5 - 1, this.P * 4 - 1);
                this.d(this.aI, this.aJ + (this.y + this.I - this.W) * 5 - 11, this.aK + (this.A + this.K - this.X + this.aL) * 4 - 8, this.f / this.k);
            }
            else {
                this.d(this.aI, this.aJ, this.aK, this.f / this.k);
            }
            this.S = true;
        }
        else {
            if (n == 3 && this.aI == 11) {
                a(f.a[f.M], f.a[this.c[1]], 0, 0, this.j[23][this.b[1][1181] & 0xFFF] * 4, this.j[24][this.b[1][1181] & 0xFFF] * 4, 11 + this.aJ, 8 + this.aK, 0);
                return;
            }
            if (n == 3 && this.aI == 10) {
                try {
                    this.c(this.o);
                    f.a[f.M].drawImage(this.a[2][0], (11 + this.aJ) * 1, (8 + this.aK) * 1, 3);
                    return;
                }
                catch (final Exception ex) {
                    return;
                }
            }
            if (n == 3 && this.aI <= 2) {
                this.k(n2);
                return;
            }
            if (n != 3 || this.aI > 6) {
                if (n == 4) {
                    if (this.aI != 1) {
                        final int ai = this.aI;
                        this.bc = 11 + this.aJ + (this.j[21][ai] & 0x7F);
                        this.bd = 8 + this.aK + this.j[22][ai];
                        this.be = this.j[23][ai];
                        this.bf = this.j[24][ai];
                        c(f.a[this.N], this.bc, this.bd, this.be, this.bf);
                        return;
                    }
                    this.bc = 0;
                    this.bd = 0;
                    this.be = 528;
                    this.bf = 704;
                    c(f.a[this.N], this.bc, this.bd, this.be, this.bf);
                }
                return;
            }
            if (n2 - 1 == 1128 && (this.u[0] == 3 || this.u[0] == 1)) {
                this.a.a(this.aJ, this.aK, (this.j[3][n2] & 0xFF) >> 6, 108 + this.e[6868 + this.k[2][0]], this.aF + ((this.e[1515 + this.k[2][0]] != 0) ? 1 : 0), -1, this.aI - 5);
                return;
            }
            this.a.a(this.aJ, this.aK, (this.j[3][n2] & 0xFF) >> 6, this.aF, this.aI - 5);
        }
    }
    
    private void j(final int n) {
        if (n - 1 == 1118) {
            int n2 = this.r[this.as];
            if (this.ad != 6) {
                n2 = ((n2 == 16) ? this.e[8749 + this.q] : (n2 - 6 + 20));
            }
            final byte b = this.a[this.a[138] + 468 + n2];
            int n3 = 0;
            for (int i = 0; i < 3; ++i) {
                if (this.a[this.a[138] + (10 + i) * 26 + n2] != 0) {
                    final int n4 = this.aK - this.a[this.a[283] + 2] * (b - 1) / 2 + (this.a[this.a[283] + 2] + 2) * n3;
                    ++n3;
                    this.a(627 + i, this.aJ - 10 + 3, n4);
                    this.a.a(this.aJ + 19, n4, (this.j[3][n] & 0xFF) >> 6, String.valueOf(this.a[this.a[138] + (10 + i) * 26 + n2]), 0);
                }
            }
            return;
        }
        if (n - 1 == 1107) {
            final int n5 = this.r[this.as] + 12;
            int n6 = 0;
            for (int j = 0; j < 3; ++j) {
                if (this.a[this.a[138] + (10 + j) * 26 + n5] != 0) {
                    final int n7 = this.aJ - 34 * (this.a[this.a[138] + 468 + n5] - 1) / 2 + 30 * n6;
                    ++n6;
                    this.a(627 + j, n7 - 2 - 4, this.aK);
                    this.a.a(n7 + 15, this.aK, (this.j[3][n] & 0xFF) >> 6, String.valueOf(this.a[this.a[138] + (10 + j) * 26 + n5]), 0);
                }
            }
            this.d[8] = 0;
            if (this.e[8749 + this.q] == 6 && this.r[this.as] != 1) {
                this.d[8] = -20;
            }
            return;
        }
        switch (n - 1) {
            case 1073: {
                this.aF /= 21;
                break;
            }
        }
        this.a(this.aI + this.aF, this.aJ, this.aK);
    }
    
    private void k(final int n) {
        switch (n - 1) {
            case 1043:
            case 1047:
            case 1051:
            case 1059:
            case 1063: {
                if (this.aF >= 0 && this.a[this.a[126] + this.aF] != -1) {
                    this.aF = this.e[this.b[this.a[this.a[126] + this.aF]] + this.l] + this.a[this.a[127] + this.aF];
                    break;
                }
                return;
            }
            case 1067: {
                if (this.aF == 0 || this.e[3535 + this.l] == 0 || this.e[3535 + this.l] == 15) {
                    return;
                }
                break;
            }
            case 1055: {
                this.aF = (9 - this.aF) * 2 + 1;
                break;
            }
        }
        switch (n - 1) {
            case 1015: {
                this.a.a(this.aJ, this.aK, (this.j[3][n] & 0xFF) >> 6, String.valueOf(this.aF) + "/" + this.a[0][16], this.aI - 1);
                return;
            }
            default: {
                this.a.a(this.aJ, this.aK, (this.j[3][n] & 0xFF) >> 6, String.valueOf(this.aF), this.aI - 1);
            }
        }
    }
    
    private boolean c() {
        this.G = false;
        if (this.aD == 0) {
            for (byte b = 0; b < 5; ++b) {
                if (this.a[0][this.a[this.a[146] + b]] != this.d[this.a[this.a[195] + 60 + 0] + b]) {
                    this.G = true;
                    this.d[this.a[this.a[195] + 60 + 0] + b] = this.a[0][this.a[this.a[146] + b]];
                    this.k[this.a[this.a[195] + 60 + 0] + b] = 1;
                }
            }
        }
        else if (this.aD == 1 || this.aD == 9) {
            this.x();
        }
        else if (this.aD == 2 || this.aD == 5) {
            this.z();
        }
        else if (this.aD == 4) {
            this.y();
        }
        else if (this.aD == 6) {
            this.A();
        }
        else if (this.aD == 7 || this.aD == 8) {
            if (this.d[46] != this.r[this.as] || this.b[this.aD]) {
                this.d[46] = this.r[this.as];
                this.G = true;
                if (this.r[this.as] < 10) {
                    this.d[this.a[this.a[195] + 60 + this.aD]] = this.r[this.as];
                    this.d[this.a[this.a[195] + 60 + this.aD] + 1] = this.a[this.a[138] + 338 + this.r[this.as] + 12];
                    this.d[this.a[this.a[195] + 60 + this.aD] + 2] = this.a[this.a[138] + 364 + this.r[this.as] + 12];
                }
            }
        }
        else if (this.aD == 10) {
            if (this.Q == 16 && this.z != this.y) {
                this.k[53] = 1;
            }
        }
        else if (this.aD == 15) {
            this.d[73] = (short)(98 + this.m);
            if (this.z != this.y) {
                this.k[72] = 1;
                this.G = true;
            }
        }
        else if (this.aD == 12) {
            if (this.am >= 51 && this.q <= 2) {
                this.am = 51;
            }
            this.d[57] = (short)((this.a[0][17] == this.am) ? 104 : ((short)(108 + this.e[6868 + this.am])));
            if (this.Q == 17 && this.al == 3 && (this.ai == 35 || this.ai == 50 || this.ai == 54)) {
                this.d[57] = 105;
            }
            this.d[58] = this.e[2727 + this.am];
            if (this.z != this.y) {
                this.k[56] = 1;
                this.G = true;
            }
        }
        else if (this.aD == 13) {
            this.d[62] = (short)(82 + ((this.q == 7) ? 21 : this.a[this.a[248] + this.q]));
            this.d[63] = this.ak;
            if (this.z != this.y) {
                this.k[61] = 1;
                this.G = true;
            }
        }
        else if (this.aD == 14) {
            this.T = (this.W != 0);
            this.U = (this.W + f.ag < this.c);
            this.Q = (this.X == 0);
            this.R = (this.X + f.ah >= this.d);
            if (this.d[66] != this.W || this.d[71] != this.X) {
                this.d[66] = (short)this.W;
                this.d[71] = (short)this.X;
                this.D();
            }
            this.k[66] = 1;
            final int n = 0;
            this.ag = n;
            this.af = n;
        }
        else if (this.aD == 17) {
            this.B();
        }
        else if (this.aD == 16) {
            if (this.z != this.y) {
                this.k[76] = 1;
                this.G = true;
            }
        }
        else if (this.aD == 18 || this.aD == 19) {
            for (byte b2 = 0; b2 < this.a[this.a[307] + this.m]; ++b2) {
                this.k[this.a[this.a[195] + 60 + this.aD] + b2] = (byte)((b2 == this.Z) ? 1 : 0);
            }
        }
        return this.G;
    }
    
    private void x() {
        this.k[47] = this.ay;
        for (int i = 0; i < 2; ++i) {
            this.k[48 + i] = (byte)((this.F == 2 + i) ? 2 : (this.a[2 + i][0] > 0));
        }
        this.k[50] = (byte)(41 + this.u[0]);
        this.k[51] = this.a[this.a[304] + this.u[0]];
        for (int j = this.a[this.a[195] + 60 + 9]; j < this.a[this.a[195] + 60 + 9] + 5; ++j) {
            if (this.k[j] != -1) {
                if (this.d[j] != this.k[j]) {
                    this.d[j] = this.k[j];
                    this.k[j] = 1;
                    this.G = true;
                }
                else {
                    this.k[j] = 0;
                }
            }
        }
    }
    
    private void y() {
        for (byte b = 0; b < 23; ++b) {
            if (this.e[this.b[this.a[this.a[147] + b]] + this.l] != this.d[this.a[this.a[195] + 60 + 4] + b]) {
                this.G = true;
                this.d[this.a[this.a[195] + 60 + 4] + b] = this.e[this.b[this.a[this.a[147] + b]] + this.l];
                this.k[this.a[this.a[195] + 60 + 4] + b] = 1;
            }
        }
        if (this.k[11] == 1 || this.k[12] == 1) {
            this.k[11] = (this.k[12] = 1);
        }
        if (this.e[3636 + this.l] == 0) {
            this.d[29] = 0;
        }
        this.d[14] = (short)(108 + this.e[6868 + this.l]);
    }
    
    private void z() {
        if (this.d[4] > 0) {
            this.v = this.d[4];
            this.k[5] = (this.k[3] = -1);
            this.G = true;
            return;
        }
        if (this.d[5] != this.r[this.as] || this.b[this.aD]) {
            this.d[5] = this.r[this.as];
            this.k[5] = (this.k[3] = 1);
            this.d[3] = (short)((this.r[this.as] >= 10) ? ((short)(21 + this.r[this.as] - 10)) : ((this.r[this.as] >= 0) ? ((short)(12 + this.r[this.as])) : (this.K ? 41 : ((this.F || !this.V) ? ((short)(108 + this.e[6868 + -this.r[this.as]])) : 29))));
            this.k[4] = -1;
            this.G = true;
        }
    }
    
    private void A() {
        if (this.d[36] != this.r[this.as] || this.b[this.aD]) {
            this.v = 0 + this.r[this.as];
            this.d[36] = this.r[this.as];
            final byte[] k = this.k;
            final int n = 36;
            final byte[] i = this.k;
            final int n2 = 38;
            final byte[] j = this.k;
            final int n3 = 34;
            final byte b = 1;
            j[n3] = b;
            k[n] = (i[n2] = b);
            this.k[35] = (this.k[37] = 1);
            this.G = true;
        }
        if (this.z != this.y) {
            this.k[38] = 1;
            this.G = true;
        }
        this.d[34] = (short)(0 + this.r[this.as]);
    }
    
    private void B() {
        if (this.v == 1) {
            final byte[] k = this.k;
            final byte b = this.a[this.a[195] + 60 + this.aD];
            int n = 0;
            Label_0125: {
                if (this.w == 3 || this.Y == 4 || (this.q > 0 && this.e[8749 + this.q] == 0 && this.r[this.as] >= 0 && this.r[this.as] <= 5)) {
                    n = 2;
                }
                else {
                    if (this.w != 4) {
                        if (this.w != 2) {
                            n = 1;
                            break Label_0125;
                        }
                    }
                    n = 0;
                }
            }
            k[b] = (byte)n;
            this.k[this.a[this.a[195] + 60 + this.aD] + 1] = (byte)(this.K ? 2 : ((this.w == 1 || this.F != -1 || (this.ad != 1 && this.ad != 9)) ? 0 : 1));
        }
        else if (this.Q == 32) {
            this.k[this.a[this.a[195] + 60 + this.aD]] = 2;
            this.k[this.a[this.a[195] + 60 + this.aD] + 1] = 3;
        }
        else {
            this.k[this.a[this.a[195] + 60 + this.aD]] = this.a[this.a[153] + 116 + this.Q];
            this.k[this.a[this.a[195] + 60 + this.aD] + 1] = this.a[this.a[153] + 145 + this.Q];
        }
        for (int i = this.a[this.a[195] + 60 + 17]; i < this.a[this.a[195] + 60 + 17] + 2; ++i) {
            if (this.d[i] != this.k[i]) {
                this.d[i] = this.k[i];
                this.k[i] = 1;
                this.G = true;
            }
            else {
                this.k[i] = 0;
            }
        }
    }
    
    private void a(final int n, final byte b, final int n2) {
        for (int i = 0; i < this.aW; ++i) {
            this.N = n;
            final int n3 = f.aV * i;
            int n4 = 1;
            if (this.aX + i == this.as) {
                n4 = 0;
            }
            else if (b == 2) {
                continue;
            }
            this.b(this.b[1][n] & 0xFFF, this.aY + n3, n2 - 1);
            this.a(548 + n4, this.aY + n3, n2);
            final byte b2;
            f f;
            int n5;
            int n6;
            int n7;
            int f2;
            if ((b2 = this.r[this.aX + i]) < 0) {
                this.a(-b2, this.aY + n3 + 1, n2 + 8 + 2 + 3, -8, (byte)29);
                if (!this.V || this.F || this.aX + i != this.as) {
                    continue;
                }
                f = this;
                n5 = 18;
                n6 = this.aY + n3;
                n7 = n2;
                f2 = this.f;
            }
            else {
                if (b2 <= 8) {
                    this.a(659 + b2, this.aY + n3, n2);
                    int n8 = 0;
                    int n9 = 0;
                    if (this.e[8749 + this.q] == 6) {
                        n8 = -1;
                        n9 = 6;
                    }
                    this.a.a(this.aY + n3 + 19 + n8 + 6, n2 + 5 + n9 + 2, 1, String.valueOf(this.s[i + this.aX]), 0);
                    if (this.e[8749 + this.q] != 6 && this.aX + i < this.av && this.aX + i == this.as) {
                        this.d(3, this.aY + n3 + 6, n2 + 2 + 2, this.f);
                        this.S = true;
                    }
                    continue;
                }
                f = this;
                n5 = b2;
                n6 = this.aY + n3;
                n7 = n2;
                f2 = ((this.aX + i == this.as) ? this.f : 0);
            }
            f.d(n5, n6, n7, f2);
        }
        if (this.T) {
            this.d(1, this.aY - 9, n2 + 8, this.e);
        }
        if (this.U) {
            this.d(2, this.aY + this.aZ - 9 + 9, n2 + 8, this.e);
        }
    }
    
    private void c(final int n, final int n2, final int n3) {
        final int n4 = this.a[this.a[283] + 2] + 6;
        int n5 = 0;
        this.ab = this.a[this.a[152] + this.Q + 1] - this.a[this.a[152] + this.Q];
        final int n6 = n2 + this.j[23][this.b[1][n] & 0xFFF] / 2 * 4;
        int n7 = n3 - this.ab * n4 / 2 + n4 / 2;
        for (int i = 0; i < this.ab; ++i) {
            if (i == this.Z) {
                n5 = n7;
            }
            this.b(this.b[1][n] & 0xFFF, n2, n7);
            this.a.a(n6, n7, 1, 57 + this.a[this.a[151] + this.a[this.a[152] + this.Q] + i], 0);
            n7 += n4;
        }
        this.a.a(f.a[this.N]);
        this.d(2, n6 - 50 - 20, n5 + 4, this.e);
        this.d(1, n6 + 49 + 20, n5 + 4, this.e);
    }
    
    final void a(final int n) {
        f.af += (byte)n;
        if (f.af > 98) {
            f.af = 98;
        }
        final byte[] n2 = this.n;
        final int n3 = 2;
        final byte[] n4 = this.n;
        final int n5 = 3;
        final byte[] n6 = this.n;
        final int n7 = 4;
        final byte af = f.af;
        n6[n7] = af;
        n2[n3] = (n4[n5] = af);
        for (int i = 0; i < 5; ++i) {
            f.a[f.M].setColor(this.f[i]);
            a(f.a[f.M], 70 + this.l[i], 312 + this.m[i], this.n[i], this.o[i]);
        }
        if (!this.y) {
            this.a.a.a();
            Thread.yield();
            return;
        }
        this.l();
    }
    
    private void c(final byte b) {
        try {
            System.gc();
            Thread.yield();
            final DataInputStream dataInputStream = new DataInputStream(this.getClass().getResourceAsStream("/pi8"));
            for (byte b2 = 0; b2 < 12; ++b2) {
                final byte b3;
                if ((b3 = (byte)(dataInputStream.readByte() & 0xFF)) == 255) {
                    break;
                }
                final short len;
                final byte[] b4 = new byte[len = (short)(b3 << 8 | (dataInputStream.readByte() & 0xFF))];
                dataInputStream.read(b4, 0, len);
                if (b2 == b) {
                    this.a[2][0] = Image.createImage(b4, 0, (int)len);
                    break;
                }
            }
            dataInputStream.close();
        }
        catch (final Exception ex) {}
    }
    
    private void C() {
        this.aM = ((this.c > f.ag) ? f.ag : this.c);
        this.aN = ((this.d > f.ah) ? f.ah : this.d);
        this.N = 1;
        this.b(this.b[1][1181] & 0xFFF, -11, -8);
        int n = 0;
        int n2 = 0;
        int n3 = 0;
        for (int i = 0; i < this.aN; ++i) {
            int n4 = 0;
            int ao = -1;
            for (int j = 0; j <= this.aM; ++j) {
                if (j == this.aM) {
                    n3 = 1;
                }
                else {
                    this.e(this.W + j, this.X + i);
                }
                if (n3 == 0 && this.aO == ao) {
                    ++n2;
                }
                else {
                    if (n2 > 0) {
                        f.a[this.N].setColor(ao);
                        a(f.a[this.N], n4 * 5 - 11, (this.aL + n) * 4 - 8, n2 * 5, 4);
                        n2 = 0;
                    }
                    if (n3 != 0) {
                        n3 = 0;
                    }
                    else {
                        ao = this.aO;
                        n4 = j;
                        n = i;
                        n2 = 1;
                    }
                }
            }
        }
    }
    
    private void D() {
        this.N = f.M;
        final int n = (this.b[1][1181] >> 12 & 0x3) << 7;
        this.b(this.b[1][1181] & 0xFFF, 120 + this.j[1][1181] + 11, 160 + this.j[2][1181] + 8 + n);
        a(f.a[f.M], f.a[this.c[1]], (this.af + 1) / 2 * 5, (this.ag + 1) / 2 * 4, this.j[23][this.b[1][1181] & 0xFFF] * 5 - 5 * this.a[this.a[148] + this.af + 1] - 44, this.j[24][this.b[1][1181] & 0xFFF] * 5 - 4 * this.a[this.a[148] + this.ag + 1] - 32, 131 + this.j[1][1181] + (-this.af + 1) / 2 * 5, 168 + this.j[2][1181] + (-this.ag + 1) / 2 * 4 + n, 0);
        f.a[this.c[1]].drawImage(f.a[this.c[0]], -(120 + this.j[1][1181] + 11) * 1, -(160 + this.j[2][1181] + 8 + n) * 1, 0);
        final int n2 = (this.af + 1 >> 1) * (this.aM - 1);
        final int n3 = (this.ag + 1 >> 1) * (this.aN - 1);
        this.N = 1;
        if (this.ag == 0) {
            f.a[this.N].setColor(11180356);
            a(f.a[this.N], n2 * 5 - 11, n3 - 8, 5, f.ah * 4);
            for (int i = 0; i < this.aN; ++i) {
                this.e(this.W + n2, this.X + i);
                f.a[this.N].setColor(this.aO);
                a(f.a[this.N], n2 * 5 - 11, (this.aL + i) * 4 - 8, 5, 4);
            }
        }
        else if (this.af == 0) {
            for (int j = 0; j < this.aM; ++j) {
                this.e(this.W + j, this.X + n3);
                f.a[this.N].setColor(this.aO);
                a(f.a[this.N], j * 5 - 11, (this.aL + n3) * 4 - 8, 5, 4);
            }
        }
    }
    
    private void e(final int n, final int n2) {
        this.aO = -1;
        final byte a;
        if ((a = this.a(n, n2)) != 2) {
            if (this.c[n2][n] > 0) {
                this.aO = ((a((int)this.c[n2][n]) == 1 && (this.e[7979 + this.c[n2][n]] & 0x2) != 0x0) ? -1 : this.b[a][a((int)this.c[n2][n]) + 6]);
            }
            else if (this.c[n2][n] < 0) {
                this.aO = this.b[a][b((int)this.c[n2][n]) + 9];
            }
            if (this.aO == -1) {
                this.aO = this.b[a][this.a[this.a[194] + (this.b[n2][n] & 0xFF)]];
            }
        }
        else {
            this.aO = 6049325;
        }
    }
    
    private void E() {
        this.W = this.I - f.ag / 2 + (this.O >> 1);
        this.W = ((this.W < 0) ? 0 : ((this.W + f.ag >= this.c) ? (this.c - f.ag) : this.W));
        if (f.ah > this.d) {
            this.aL = f.ah - this.d >> 1;
            return;
        }
        this.X = this.K - f.ah / 2 + (this.P >> 1);
        this.X = ((this.X < 0) ? 0 : ((this.X + f.ah >= this.d) ? (this.d - f.ah) : this.X));
    }
    
    private void F() {
        if (this.c == -1 && this.a[this.a[153] + 0 + this.Q] == 1) {
            this.G();
        }
        else if (this.a[this.a[153] + 0 + this.Q] == 1) {
            this.H();
        }
        else if (this.Q == 23) {
            this.I();
        }
        else if (this.Q == 15) {
            this.J();
        }
        else if (this.Q == 17) {
            this.P();
        }
        else if (this.Q == 20) {
            this.K();
        }
        else if (this.Q == 18) {
            if (this.H) {
                this.H = false;
                this.b[13] = true;
                this.b[11] = true;
                this.a((byte)11, 0, 0);
                this.a((byte)17, 0, 320);
            }
            this.a((byte)13, 0, 0);
        }
        else if (this.Q == 19) {
            this.L();
        }
        else if (this.Q == 24) {
            if (this.H) {
                this.H = false;
                this.b[11] = (this.b[16] = true);
                this.a((byte)11, 0, 0);
                this.a((byte)16, 0, 0);
                this.a((byte)17, 0, 320);
            }
        }
        else if (this.Q == 25) {
            this.M();
        }
        else if (this.Q == 27) {
            this.N();
        }
        else if (this.Q == 32 && this.H) {
            this.H = false;
            try {
                f.a[f.M].drawImage(Image.createImage("/l3"), 11, 8, 20);
            }
            catch (final Exception ex) {}
            this.b[17] = true;
            this.a((byte)17, 0, 320);
        }
        this.N = this.c[1];
    }
    
    private void G() {
        if (this.H) {
            this.H = false;
            this.N = this.c[1];
            f.a[this.N].setColor(9422847);
            a(f.a[this.N], 0, -8, this.a[this.N], this.b[this.N]);
            f.a[this.N].setColor(940839);
            a(f.a[this.N], 0, -8 + this.b[this.N] - 64, this.a[this.N], 64);
            this.S = 0;
            this.T = 248;
            this.a(1118, (byte)2);
            if (this.Q == this.U || this.Q == 3 || this.Q == 12 || this.Q == 13 || this.Q == 2 || this.Q == this.V || this.Q == 9 || this.Q == 14) {
                this.k[53] = -1;
                this.k[54] = 1;
            }
            else if (this.Q == 16 || this.Q == 21 || this.Q == 22) {
                this.k[53] = 1;
                this.k[54] = -1;
            }
            this.k[52] = -1;
        }
        this.N = f.M;
        f.a[this.N].drawImage(f.a[this.c[1]], 0, 328, 36);
        f.a[this.N].setColor(9422847);
        a(f.a[this.N], 0, 0, this.a[this.N], 80);
        for (int i = 0; i < 4; ++i) {
            if (this.a[0][i] > 240 || this.a[0][3] == -1000) {
                this.a[0][i] = -88 - this.a(65535, 60);
                this.a[1][i] = this.a(65535, 48);
                this.a[2][i] = this.a(255, 4);
            }
            final int n = 1667 + this.a[2][i];
            final int[] array = this.a[0];
            final int n2 = i;
            final int n3 = array[n2] + (this.a[2][i] + 2 >> 1);
            array[n2] = n3;
            final int[] array2 = this.a[1];
            final int n4 = i;
            this.a(n, n3, array2[n4] += ((this.a(255, 5) == 0) ? (this.a(255, 3) - 1) : 0));
        }
        if (this.Q == this.U || this.Q == 12 || this.Q == 13 || this.Q == 2 || this.Q == this.V || this.Q == 9 || this.Q == 14) {
            this.k[53] = -1;
            this.k[54] = 1;
        }
        else if (this.Q == 16 || this.Q == 21 || this.Q == 22) {
            this.k[53] = 1;
            this.k[54] = -1;
        }
        this.k[52] = -1;
        this.b[10] = true;
        this.a(1665, 120, 0);
        this.S = 0;
        this.T = 272;
        this.a(1118, (byte)1);
        this.a((byte)10, 25, 64);
        this.b[17] = true;
        this.a((byte)17, 0, 320);
    }
    
    private void H() {
        if (this.H) {
            this.H = false;
            this.O();
            if (this.Q == 10 || this.Q == 11 || this.Q == 12 || this.Q == 13) {
                this.k[53] = -1;
                this.k[54] = 1;
            }
            else if (this.Q == 16 || this.Q == 21 || this.Q == 22) {
                this.k[53] = 1;
                this.k[54] = -1;
            }
            this.k[52] = -1;
            this.b[10] = true;
        }
        this.a((byte)10, 25, 64);
        this.a((byte)17, 0, 320);
    }
    
    private void I() {
        if (this.H) {
            this.H = false;
            this.b[11] = true;
            this.v = 69;
            this.k[55] = 1;
            this.a((byte)11, 0, 0);
            this.k[55] = -1;
        }
    }
    
    private void J() {
        if (this.H) {
            this.H = false;
            this.b[11] = (this.b[15] = true);
            this.a((byte)11, 0, 0);
            this.a((byte)17, 0, 320);
        }
        this.a((byte)15, 0, 0);
    }
    
    private void K() {
        if (this.H) {
            this.H = false;
            this.A = true;
            this.n();
            this.u();
            this.O();
            this.b[12] = true;
        }
        this.a((byte)12, 0, 0);
        this.a((byte)17, 0, 320);
    }
    
    private void L() {
        if (this.H) {
            this.H = false;
            this.b[11] = true;
            this.a((byte)11, 0, 0);
            this.b[14] = true;
            this.C();
        }
        this.a((byte)14, 120, 160);
        this.b[17] = true;
        this.a((byte)17, 0, 320);
    }
    
    private void M() {
        this.H = false;
        if (!this.I) {
            this.O();
            f.a[1].drawImage(f.a[0], 0, 0, 0);
        }
        this.b[2] = true;
        a(f.a[0], f.a[1], 0, 0, 264, 301, 0, 0, 0);
        this.a((byte)(18 + this.m), 0, 0);
        this.a((byte)2, 0, this.d[this.a[this.a[195] + 0 + 2]]);
        this.a((byte)17, 0, 320);
        this.I = true;
    }
    
    private void N() {
        if (this.ab) {
            this.ab = false;
            this.x = this.v;
            this.v = 61;
            this.b[11] = true;
            this.k[55] = 1;
            this.a((byte)11, 0, 0);
            this.k[55] = -1;
            this.a((byte)17, 0, 320);
        }
    }
    
    private void O() {
        this.c[9] = (this.c[8] = 0);
        a(f.a[this.c[0]], f.a[this.c[1]], 0, 0, 264, this.A, 0, this.bb - this.ax, 0);
        for (byte b = 0; b < 20; ++b) {
            if (this.a[b]) {
                this.b[b] = true;
                this.a(b, 0, this.d[this.a[this.a[195] + 0 + b]]);
                this.N = this.c[0];
                if (this.a[this.a[195] + 20 + b] == 1 && this.Q != 20) {
                    this.a(524, 0, 0 + this.bb);
                }
                else if (this.a[this.a[195] + 20 + b] == 2) {
                    this.a(528, 0, 320 - this.ba);
                }
            }
        }
        this.c[9] = (this.c[8] = 2);
    }
    
    private void P() {
        if (this.aP > 0 && !this.J) {
            this.aP += 4;
            f.a[f.M].setColor(0);
            a(f.a[f.M], 0, 0, 240, 16 + this.aP);
            a(f.a[f.M], 0, 336 - this.aP, 240, this.aP);
            this.c = true;
            if (this.aP - 4 <= 160) {
                return;
            }
            this.aP = -this.aP;
            this.c = false;
            this.i();
        }
        if (this.H && !this.J) {
            this.b[12] = true;
            f.a[f.M].setColor(0);
            a(f.a[f.M], 0, 0, 240, 112);
            a(f.a[f.M], 0, 240, 240, 96);
        }
        if (this.a[this.a[155] + 0 + this.aS] == 1) {
            if (this.aR >= 0) {
                if (this.aR < this.a[this.a[155] + 84 + this.aS] || this.am != 0) {
                    this.N = 0;
                    f.a[f.M].setColor(0);
                    a(f.a[f.M], 0, 112, 240, 128);
                    this.d(98 + this.a[this.a[155] + 28 + this.aS], 120, 176, (this.am == 0) ? this.aR : this.f);
                    this.d(104, 120, 176, this.f);
                    this.aR = ((this.am == 0) ? (this.aR + 1) : this.aR);
                }
                else if (this.am == 0 && this.aS != 0) {
                    this.aR = -1;
                    this.j = true;
                    return;
                }
            }
        }
        else if (this.a[this.a[155] + 0 + this.aS] >= 2 || this.a[this.a[155] + 0 + this.ao] >= 2) {
            this.Q();
            this.R();
        }
        this.H = false;
        if (this.aP < 0) {
            this.aP += 4;
            this.c = true;
            if (this.aP >= -48) {
                this.aP = 0;
                this.c = false;
                this.i();
            }
        }
        if (this.aP == 0 && this.al != 0) {
            this.a((byte)12, 0, 0);
            this.a((byte)17, 0, 320);
        }
    }
    
    private void Q() {
        if (this.aS > 0 && this.aR >= 0 && (this.aP == 0 || this.H)) {
            if (this.aR == 0 && this.a[this.a[155] + 28 + this.aS] > 0) {
                for (int i = 0; i < this.p.length; ++i) {
                    if (this.p[i] != 0) {
                        final int n = (i > 6) ? 6 : i;
                        if (this.a[this.a[196] + n * 33 + 0 + this.a[this.a[155] + 28 + this.aS] * 3] != 0) {
                            this.e[2929 + this.p[i]] = this.a[this.a[196] + n * 33 + 0 + this.a[this.a[155] + 28 + this.aS] * 3];
                            this.e[1313 + this.p[i]] = this.a[this.a[196] + n * 33 + 2 + this.a[this.a[155] + 28 + this.aS] * 3];
                            this.e[2828 + this.p[i]] = 105;
                        }
                        if (this.a[this.a[196] + n * 33 + 1 + this.a[this.a[155] + 28 + this.aS] * 3] != 0) {
                            this.e[606 + this.p[i]] = (byte)(-10 + this.a[this.a[196] + n * 33 + 1 + this.a[this.a[155] + 28 + this.aS] * 3]);
                            this.e[808 + this.p[i]] = 0;
                        }
                        this.e[3030 + this.p[i]] = 0;
                    }
                }
            }
            if (this.aR >= this.a[this.a[155] + 84 + this.aS]) {
                this.aR = -2;
                if (this.al == 0) {
                    this.j = true;
                    return;
                }
            }
            ++this.aR;
            if (this.aR > 0) {
                this.j();
            }
        }
    }
    
    private void R() {
        if (this.an != 0 || this.a[this.a[155] + 84 + this.ao] >= -1 || this.aR > 0) {
            if (this.H) {
                this.A = true;
                this.N = 1;
                this.n();
            }
            if (this.J) {
                if (this.H) {
                    this.H = false;
                    this.A = true;
                    this.n();
                    this.u();
                    this.O();
                    this.b[12] = true;
                }
            }
            else if (this.aP == 0 || this.H) {
                this.aQ = 0;
                if (this.aS == 24) {
                    this.aQ = this.a(255, 8);
                }
                a(f.a[this.c[0]], f.a[this.c[1]], 0, 120, 264, 128 - this.aQ, 0, 120 + this.aQ, 0);
                if (this.aS == 24) {
                    f.a[f.M].setColor(0);
                    a(f.a[f.M], 0, 96, 240, 16);
                    a(f.a[f.M], 0, 240, 240, 16);
                }
                this.N = 0;
                this.bc = 0;
                this.bd = 120;
                this.be = 264;
                this.bf = 128;
                c(f.a[this.N], this.bc, this.bd, this.be, this.bf);
                this.u();
                this.bc = 0;
                this.bd = 0;
                this.be = 528;
                this.bf = 704;
                c(f.a[this.N], this.bc, this.bd, this.be, this.bf);
            }
        }
    }
    
    final void b(final int n) {
        this.i();
        if (n >= 0) {
            this.ai = (byte)n;
            this.S();
            this.T();
        }
        else {
            if (this.ak == this.aj - 1) {
                this.U();
                return;
            }
            ++this.ak;
        }
        this.o = 0;
        this.v = 71 + this.ak;
        this.o = (byte)(this.a[this.a[154] + this.q] + this.ak);
        this.aS = this.a[this.a[311] + 229 + this.aT + this.ak];
        this.aR = ((this.a[this.a[155] + 84 + this.aS] < 0) ? -1 : 0);
        this.al = this.a[this.a[311] + 0 + this.aT + this.ak];
        this.am = this.p[this.al];
        this.an = this.a[this.a[311] + 458 + this.aT + this.ak];
        if (this.an > 100) {
            this.f(this.an, -2);
        }
        else if (this.an == 99) {
            this.f(this.am = this.p[0], -2);
        }
        else if (this.an > 0) {
            this.f(this.p[this.an], -2);
        }
        else if (this.an == -100) {
            if (this.ai == 51) {
                this.I = 8;
                this.K = 67;
            }
            this.f(-100, -2);
        }
        else if (this.an < 0) {
            this.f(this.an, -3);
            if (this.ai == 36 || this.ai == 38) {
                this.I += 4;
                --this.K;
            }
        }
        this.H = true;
    }
    
    private void S() {
        this.aJ();
        this.t();
        this.ak = 0;
        this.Z = 0;
        this.a.a(this.ai);
        this.aT = (this.a[this.a[310] + 0 + this.ai] & 0xFF);
        this.ao = this.a[this.a[311] + 229 + this.aT];
        if (this.ai == 4 || this.ao == 0) {
            this.a[this.a[311] + 229 + this.aT] = (this.ao = 27);
        }
        this.aj = (byte)((this.a[this.a[310] + 0 + this.ai + 1] & 0xFF) - this.aT);
        this.J = (this.ao >= 27);
        this.v = 0;
        this.R = this.Q;
        this.Q = 17;
        this.aP = this.a[this.a[155] + 56 + this.ao];
        if (this.aP == 1) {
            this.O();
        }
        if (this.ao != 9 && !this.J && this.aP != 1) {
            --this.K;
        }
        this.d = new boolean[] { this.a[0], this.a[1], this.a[2], this.a[4], this.a[5], this.a[6], this.a[7], this.a[8], this.a[9] };
        this.a(true, true, false, false);
        this.s = true;
        final byte b = this.a[this.a[310] + 71 + this.ai];
        System.arraycopy(this.a, this.a[156] + this.a[this.a[157] + b], this.p, 0, this.a[this.a[157] + b + 1] - this.a[this.a[157] + b]);
    }
    
    private void T() {
        if (this.ai == 3) {
            this.d(5, 20, 2);
            this.e[6161 + this.p[2]] = 3;
            this.e[2828 + this.p[2]] = 105;
            this.e[6262 + this.p[2]] = 5;
            this.e[6363 + this.p[2]] = 10;
            this.e[1313 + this.p[2]] = 3;
            this.e[5050 + this.p[2]] = -1;
            return;
        }
        if (this.ai == 37) {
            this.a.l();
            this.aw = 1;
            this.a.a(4, 46, 9, (byte)0, (byte)9);
            this.a((byte)0, (byte)48, (byte)9, (byte)3, (byte)0);
            this.e[2934] = 14;
            this.e[611] = 2;
            this.aw = 2;
            this.a.a(1, 44, 9, (byte)1, (byte)2);
            this.a.a(1, 45, 11, (byte)1, (byte)2);
            this.e[658] = 7;
            this.a.a(1, 48, 11, (byte)1, (byte)2);
            this.e[659] = 5;
            this.a.a(2, 48, 9, (byte)1, (byte)2);
            this.a[0][17] = 0;
            return;
        }
        if (this.ai == 38) {
            this.a.l();
            this.a((byte)0, 2, 52, 18, 2, true, -1);
            this.a((byte)0, 2, 54, 16, 2, true, -1);
            this.a((byte)0, 2, 55, 19, 2, true, -1);
            this.a((byte)0, 2, 58, 19, 2, true, -1);
            this.aw = 0;
            this.a.a(5, 60, 12, (byte)0, (byte)0);
            this.aw = 2;
            this.d(57, 17, 1);
            this.a.a();
            return;
        }
        if (this.ai == 43) {
            this.b(52, 7);
            return;
        }
        if (this.ai == 45) {
            this.a.m();
            this.b(57, 30);
            this.b(1, 54, 30, 5);
            this.b(1, 54, 31, 5);
            this.b(1, 55, 31, 5);
            this.b(1, 55, 32, 5);
            return;
        }
        if (this.ai == 48) {
            this.q = 2;
            this.aM();
            this.a.f = 6;
            this.aN();
            this.q = 3;
            this.a((byte)0, 24, 18, 67, 2, true, -1);
            this.a((byte)0, 25, 19, 69, 2, true, -1);
            this.a((byte)0, 25, 21, 71, 2, true, -1);
            this.a[0][12] = 0;
            this.a((byte)0, (byte)26, (byte)69, (byte)60, (byte)0);
            this.a[0][17] = 1;
            this.a.a(7, 26, 69, (byte)0, (byte)2);
            this.d(23, 69, 1);
            this.a.a(2, 1, 69, (byte)1, (byte)3);
            this.a((byte)1, (byte)21, (byte)69, (byte)60, (byte)0);
            this.e[659] = 0;
            this.e[2982] = 42;
            this.f(53, -2);
            this.e[657] = 0;
        }
    }
    
    private void U() {
        this.a.d();
        if (this.ai == 26) {
            this.s = false;
            this.c();
            this.s = true;
        }
        if (this.ao == 9) {
            this.a.f();
        }
        else if (this.ai == 28) {
            this.d(5, 11, 0);
            final b a = this.a;
            a.I &= (byte)254;
            this.a.d[this.a[this.a[292] + 4]] = 0;
        }
        else if (this.ai == 34) {
            this.d(48, 15, 5);
            this.a.I = 0;
        }
        else if (this.ai == 38) {
            this.d(65, 18, 1);
            this.u = 1;
        }
        else if (this.ai == 44) {
            for (int i = 0; i < 10; ++i) {
                this.e[9601 + i] = this.am;
            }
            this.d(53, 5, 0);
            this.f(this.am, -2);
            this.a.a();
        }
        else if (this.ai == 48) {
            this.u = 1;
            this.d(45, 69, 6);
        }
        for (int j = 0; j < this.p.length; ++j) {
            if (this.e[2828 + this.p[j]] == 105) {
                if (this.e[4646 + this.p[j]] < 0) {
                    this.e[2828 + this.p[j]] = 69;
                }
                else {
                    this.e[2828 + this.p[j]] = 57;
                }
            }
            this.p[j] = 0;
        }
        if (this.a.f >= 50) {
            this.a.F = ((this.ai == 15) ? 1000000 : this.c);
            final b a2 = this.a;
            a2.f -= 49;
            this.a.g = this.a[this.a[294] + this.a.f - 1];
            this.a.J = 0;
        }
        if (this.ao != 9) {
            this.J = this.I;
            final byte b = (!this.J || this.d[3]) ? ((byte)(this.K + 1)) : this.K;
            this.K = b;
            this.L = b;
        }
        else {
            this.I = this.J;
            this.K = this.L;
        }
        this.s = false;
        this.aK();
        this.J = this.I;
        this.L = this.K;
        if (this.ai == 0 || this.ai == 1 || (this.ai == 2 && this.p != 0) || this.ai == 32 || this.ai == 36 || this.ai == 37 || this.ai == 39 || this.ai == 46 || this.ai == 47 || this.ai == 49 || this.ai == 55) {
            ++this.ai;
            this.Q = 28;
            this.b((int)this.ai);
            if (this.ai == 47) {
                this.Q = 18;
                this.o = this.a[this.a[154] + 8];
            }
            return;
        }
        if (this.ai != 59) {
            this.v = 1;
        }
        this.A = true;
        this.a(this.d[0], this.d[1], this.d[2], this.d[3], this.d[4], this.d[5], this.d[6], this.d[7], this.d[8]);
        this.Q = this.R;
    }
    
    private void d(final int n, final int n2, final int n3) {
        for (int i = 0; i < this.p.length; ++i) {
            if (i == n3 || i >= 6) {
                this.e(n, n2, this.p[i]);
            }
        }
    }
    
    private void e(final int n, final int n2, final int n3) {
        this.e[2828 + n3] = 69;
        this.e[3131 + n3] = (byte)n;
        this.e[3232 + n3] = (byte)n2;
        this.e[6161 + n3] = 2;
        this.e[4747 + n3] = 0;
        final byte[] e = this.e;
        final int n4 = 7979 + n3;
        e[n4] &= (byte)191;
    }
    
    final void c() {
        this.c = this.e;
        this.d = this.f;
        ++this.q;
        this.aP();
        this.a.G = this.a[219] + this.q * 4;
    }
    
    final void a(final byte ap, final byte am, final byte an) {
        if (ap < 18 && (this.l == 0 || this.Q == 17 || (ap != 18 && this.K) || this.u > 0)) {
            return;
        }
        this.Z = 0;
        this.o = 0;
        this.i();
        this.ap = ap;
        this.v = 0;
        this.Q = 20;
        this.H = true;
        this.v = 12 + ap;
        this.am = am;
        this.an = an;
        this.d = new boolean[] { this.a[0], this.a[1], this.a[2], this.a[4], this.a[5], this.a[6], this.a[7], this.a[8], this.a[9] };
        this.a(this.a[0], true, false, this.a[4]);
        this.A = true;
        if (ap == 4 || ap == 5 || ap == 14 || ap == 15) {
            this.a[this.a[153] + 145 + 20] = 0;
            return;
        }
        this.a[this.a[153] + 145 + 20] = 2;
    }
    
    protected final void keyPressed(final int n) {
        if (this.n) {
            return;
        }
        if (this.o) {
            return;
        }
        this.o = true;
        if (!a(n)) {
            return;
        }
        this.j = 0;
        if (n == f.a || n == -f.a || n == 42) {
            f.l = true;
            return;
        }
        if (n == f.b || n == -f.b || n == 35) {
            f.m = true;
            return;
        }
        switch (n) {
            case 42: {}
            case 48: {
                this.i = 0;
                break;
            }
            case 49: {
                this.i = 1;
                this.w = true;
                break;
            }
            case 51: {
                this.i = 3;
                this.w = true;
                break;
            }
            case 55: {
                this.i = 7;
                this.w = true;
                break;
            }
            case 57: {
                this.i = 9;
                this.w = true;
                break;
            }
        }
        if (this.a && this.y) {
            this.m(n);
        }
        try {
            this.m = this.getGameAction(n);
        }
        catch (final Exception ex) {
            this.m = 666;
        }
        if (this.m == 8 || n == 53) {
            this.i = true;
            this.t = true;
            ++this.n;
            if (!this.u) {
                this.E = 0;
            }
        }
        else {
            if (this.m == 1 || n == 50) {
                this.e = true;
                return;
            }
            if (this.m == 6 || n == 56) {
                this.f = true;
                return;
            }
            if (this.m == 2 || n == 52) {
                this.g = true;
                return;
            }
            if (this.m == 5 || n == 54) {
                this.h = true;
            }
        }
    }
    
    protected final void keyReleased(final int n) {
        if (this.n) {
            return;
        }
        if (!a(n)) {
            return;
        }
        this.j = 0;
        switch (n) {
            case 42: {}
            case 35: {}
            case 49: {
                this.w = false;
                break;
            }
            case 51: {
                this.w = false;
                break;
            }
            case 55: {
                this.w = false;
                break;
            }
            case 57: {
                this.w = false;
                break;
            }
        }
        try {
            this.m = this.getGameAction(n);
        }
        catch (final Exception ex) {
            this.m = 666;
        }
        if (n == 53 || this.m == 8) {
            this.t = false;
            if (this.E < 4) {
                this.v = true;
            }
        }
        if (this.o) {
            this.p = true;
            return;
        }
        if (n == 50 || this.m == 1) {
            this.e = false;
            return;
        }
        if (n == 56 || this.m == 6) {
            this.f = false;
            return;
        }
        if (n == 52 || this.m == 2) {
            this.g = false;
            return;
        }
        if (n == 54 || this.m == 5) {
            this.h = false;
        }
    }
    
    private static boolean a(final int n) {
        return n != -10;
    }
    
    private void V() {
        this.W();
        if (this.u && this.i) {
            this.i = false;
            this.aF();
        }
        else if (this.t && this.w != 3) {
            this.i = false;
            this.aE();
        }
        else {
            this.F = 0;
        }
        if (this.I >= 4 && this.w == 1) {
            this.aG();
        }
        else if (this.I > 0 && this.I < 4 && !this.w) {
            this.aH();
        }
        if (this.v) {
            this.v = false;
            this.E = 4;
            this.i = false;
            final byte b = this.c[this.K + this.A][this.I + this.y];
            if (this.w == 1 && this.W >= 51 && this.W <= 100) {
                this.y = (byte)(this.e[0 + this.W] - this.I);
                this.A = (byte)(this.e[101 + this.W] - this.K);
                this.e(this.W);
            }
            else if (this.w == 1 && a((int)b) != 0) {
                this.e(b);
            }
            else if (this.w == 3) {
                this.X();
            }
            else if (a((int)b) == 0) {
                this.d(b);
            }
            else if (this.w == 0 && b((int)b) == 0) {
                this.f((byte)(-b));
            }
            else if (a((int)this.W) == 0) {
                this.d(this.W);
                this.y = (byte)(this.e[0 + this.W] - this.I);
                this.A = (byte)(this.e[101 + this.W] - this.K);
            }
            this.E = true;
            this.e = 0;
        }
        this.aL();
        if (this.af == 0 && this.ag == 0 && !this.C) {
            this.Y();
            this.ad = this.af * 11;
            this.ae = this.ag * 8;
        }
    }
    
    private void W() {
        if (f.l) {
            f.l = false;
            if (this.w != 3) {
                this.a(true, false, false, false, true, false, false, false, false);
                this.w = 2;
                this.Z();
            }
        }
        else if (f.m) {
            f.m = false;
            if (this.w == 3) {
                this.s = 0;
                this.l(-1);
            }
            else {
                if (this.w == 1 || this.F != -1) {
                    this.k = true;
                    return;
                }
                this.v = 0;
                this.Q = (byte)((this.q < 7) ? ((this.t > -1) ? 10 : 11) : (this.W ? 10 : 11));
                this.R = 28;
                this.Z = 0;
                this.H = true;
                this.X = false;
                this.z = this.y;
                this.B = this.A;
                this.J = this.I;
                this.L = this.K;
                return;
            }
        }
        if (this.i == 1) {
            this.i = -1;
            if (this.ay == 1) {
                this.ay = 0;
                this.y = this.C;
                this.I = (byte)(this.k[0][0] - this.y);
                this.A = this.D;
                this.K = (byte)(this.k[1][0] - this.A);
                this.aK();
                this.A = true;
            }
            return;
        }
        if (this.i != 3) {
            return;
        }
        this.i = -1;
        if (this.q == 3) {
            this.a((byte)20, (byte)1, (byte)0);
            return;
        }
        this.v = 0;
        this.Q = 19;
        this.H = true;
        this.v = -1;
        final boolean b = true;
        this.R = b;
        this.Q = b;
        this.c = true;
        this.z = this.y;
        this.B = this.A;
        this.J = this.I;
        this.L = this.K;
        this.E();
        this.i();
    }
    
    private void X() {
        if (this.r) {
            if (this.s == 100) {
                if (this.O) {
                    this.N = this.O;
                    final boolean b = false;
                    this.M = b;
                    this.L = b;
                    this.a.b();
                }
                else if (this.M) {
                    this.L = this.M;
                    this.a.b();
                }
                this.q[0] = (byte)(this.I + this.y);
                this.q[1] = (byte)(this.K + this.A);
                this.l(-1);
                return;
            }
            if (this.s < 0) {
                this.e[3131 + this.r] = this.e[8383 + this.q];
                this.e[3232 + this.r] = this.e[8444 + this.q];
                this.e[2828 + this.r] = (byte)(44 + -this.s - 1);
                this.e[6161 + this.r] = 3;
                return;
            }
            if (this.s <= 3) {
                this.n = 0;
                while (this.n < 29 && this.b[0][0][this.n] != 0) {
                    ++this.n;
                }
                this.b[0][1][this.n] = (byte)this.s;
                if (this.b[0][1][this.n] == 3) {
                    this.b[0][0][this.n] = (byte)this.q;
                    this.b[0][2][this.n] = (byte)(this.I + this.y);
                    this.b[0][3][this.n] = (byte)(this.K + this.A);
                    this.l(-1);
                    return;
                }
                if (a(this.r) == 0) {
                    this.b[0][0][this.n] = (byte)this.q;
                    this.b[0][2][this.n] = (byte)this.r;
                }
            }
            else if (this.b(this.I + this.t, this.K + this.u) && this.a((byte)0, this.s, this.I + this.t, this.K + this.u, 1, false, -1) > 0) {
                this.l(-1);
                this.w = 2;
            }
        }
    }
    
    private void d(final byte b) {
        if (this.n > 1) {
            this.n = 0;
            this.B = this.I - 1;
            this.C = this.K - 1;
            this.D = this.O;
            this.E = this.P;
            this.u = true;
            this.t = true;
            this.aF();
            this.a(true, true, false, false);
            final byte b2 = 0;
            this.l = b2;
            this.k = b2;
            return;
        }
        if (this.e[1919 + b] > 0) {
            this.a(false, true, false, true);
            this.w = 1;
            this.l = b;
            this.k = b;
            this.F = -1;
        }
    }
    
    private void e(final byte b) {
        if (this.F != -1) {
            for (int i = 0; i < 50; ++i) {
                if (this.a[this.F][i] > 0) {
                    this.a(this.a[this.F][i], b);
                }
            }
        }
        else {
            this.a(this.k, b);
        }
        this.n = 0;
    }
    
    private void a(final byte b, final byte b2) {
        if (this.e[505 + b] < 10 && !this.N && (!this.L || (this.e[7979 + b] & 0x40) == 0x0)) {
            this.a.a((byte)12, b, 0);
            return;
        }
        if (b((int)b2) == 0 && this.e[8749 + -b2] == 6) {
            this.a(true, false, true, false);
            this.q = -b2;
            this.w = 2;
            this.Z();
            return;
        }
        if (this.n > 1 || (this.e[3131 + b] == this.y + this.I && this.e[3232 + b] == this.A + this.K)) {
            this.q = true;
            if (this.e[7777 + b] == 0) {
                this.e[7777 + b] = 3;
                this.a.b((int)b);
                if (this.e[7777 + b] > 0) {
                    this.e[1111 + b] = (byte)((this.e[1111 + b] & 0xF0) + this.a[this.a[129 + (this.e[606 + b] & 0x1) * 2] + this.a[this.a[129 + (this.e[606 + b] & 0x1) * 2 + 1] + this.e[1010 + b] - 5] + (this.e[1111 + b] & 0xF)]);
                }
            }
        }
        else if (this.e[7777 + b] > 0) {
            this.e[1111 + b] = (byte)((this.e[1111 + b] & 0xF0) + this.a[this.a[133 + (this.e[606 + b] & 0x1) * 2] + this.a[this.a[133 + (this.e[606 + b] & 0x1) * 2 + 1] + this.e[1010 + b] - 5] + (this.e[1111 + b] & 0xF)]);
            this.e[7777 + b] = 0;
        }
        this.e[3131 + b] = (byte)(this.y + this.I);
        this.e[3232 + b] = (byte)(this.A + this.K);
        final byte[] e = this.e;
        final int n = 7979 + b;
        e[n] &= (byte)223;
        this.e[6161 + b] = 2;
        this.e[4747 + b] = b2;
        this.ab = (byte)(this.y + this.I);
        this.ac = (byte)(this.A + this.K);
        this.aa = (byte)(((a((int)b2) == 1 || b((int)b2) == 1 || b((int)b2)) && this.a(this.y + this.I, this.A + this.K) == 0) ? 2 : 1);
    }
    
    final void c(final int n) {
        for (int i = (n - 1) / 50 * 30 + 1; i <= (n - 1) / 50 * 30 + 30; ++i) {
            if (this.e[8810 + i] == n && (this.e[8749 + i] != 2 || this.e[8627 + i] != 0)) {
                this.a(i, false);
                this.e[8810 + i] = 0;
                this.e[9298 + i] = 0;
                return;
            }
            if ((this.e[8627 + i] == 2 || this.e[8627 + i] == 1) && this.e[9237 + i] == n) {
                this.e[9237 + i] = 0;
            }
        }
    }
    
    final void a(final int n, final boolean b) {
        for (byte b2 = this.e[8993 + n]; b2 > 0; b2 = this.e[4545 + b2]) {
            if ((this.e[4646 + b2] != 0 || b) && (this.e[8749 + n] != 11 || this.e[8627 + n] != 0 || this.a[this.a[18] + this.e[6565 + b2]] == 0) && this.e[2929 + b2] != -108 && this.e[2929 + b2] != this.a[this.a[173] + this.a[this.a[174] + this.e[8749 + n]] + this.e[4646 + b2]] && this.e[2929 + b2] != this.a[this.a[176] + this.a[this.a[177] + this.e[8749 + n]] + this.e[4646 + b2]]) {
                this.a(b2, n, false, false);
            }
        }
    }
    
    private void f(final byte q) {
        if (this.e[8749 + q] == 3 && this.e[4444 + this.a[0][17]] != q) {
            this.r[0] = (this.as = 0);
            this.l(4);
            return;
        }
        this.a(true, false, true, false);
        this.q = q;
        this.w = 2;
        this.k = 0;
        this.Z();
    }
    
    private void Y() {
        if (this.B) {
            return;
        }
        if (this.g) {
            if (this.y > this.C) {
                --this.y;
                return;
            }
            if (this.I > 0) {
                --this.I;
                this.af = -1;
                return;
            }
            if (this.y > 0) {
                --this.y;
            }
        }
        else if (this.h) {
            if (this.y < this.C) {
                ++this.y;
                return;
            }
            if (this.I < this.c - this.O) {
                ++this.I;
                this.af = 1;
                return;
            }
            if (this.I + this.y < this.c - 1 - 0) {
                ++this.y;
            }
        }
        else if (this.e) {
            if (this.A > this.D) {
                --this.A;
                return;
            }
            if ((this.K > 0 && !this.a[4]) || (this.K > 1 && this.a[4])) {
                --this.K;
                this.ag = -1;
                return;
            }
            if (this.A > 0) {
                --this.A;
            }
        }
        else if (this.f) {
            if (this.A < this.D) {
                ++this.A;
                return;
            }
            if (this.K < this.d - this.P - 1 - (this.ba >> 5)) {
                ++this.K;
                this.ag = 1;
                return;
            }
            if (this.K + this.A < this.d - 2 - 0 - (this.ba >> 5)) {
                ++this.A;
            }
        }
    }
    
    private void Z() {
        try {
            if (!this.a[2] && !this.a[5] && !this.a[6]) {
                return;
            }
            this.ar = 0;
            for (int i = 0; i < this.r.length; i = (byte)(i + 1)) {
                this.r[i] = 0;
            }
            this.at = 99;
            if (this.a[2]) {
                this.aa();
                this.ab();
                this.ac();
            }
            else if (this.a[5]) {
                this.ad();
            }
            else {
                if (!this.a[6]) {
                    this.ah();
                    return;
                }
                for (short n = (short)((this.q > 1) ? 11 : ((this.ai < 18) ? 3 : 6)), n2 = 0; n2 < n; n2 = (byte)(n2 + 1)) {
                    this.r[n2] = this.a[this.a[137] + n2];
                    ++this.ar;
                }
            }
            if (this.P) {
                while (this.aX + this.aW > this.ar) {
                    if (this.as == 0) {
                        break;
                    }
                    if (this.aX > 0) {
                        --this.aX;
                    }
                    --this.as;
                }
            }
            else {
                this.as = 0;
                this.aX = 0;
                this.l = 0;
            }
            this.b[this.ad] = true;
            this.aW = f.aU;
            if (this.ar < this.aW) {
                this.aW = this.ar;
            }
            this.aZ = f.aV * this.aW;
            this.aY = (240 - this.aZ + 9) / 2;
            this.ai();
        }
        catch (final Exception ex) {}
    }
    
    private void aa() {
        if (this.e[8749 + this.q] == 0) {
            this.au = 0;
            while (this.a[0][this.au][11] != this.q) {
                ++this.au;
            }
            this.av = -1;
            final int n = this.e[9115 + this.q] - 1;
            for (byte b = this.a[this.a[144] + n]; b < this.a[this.a[144] + n + 1]; ++b) {
                if (0 + this.a[this.a[143] + b] >= 6 && this.av == -1) {
                    this.av = (byte)(b - this.a[this.a[144] + n]);
                }
                this.r[this.ar] = this.a[this.a[143] + b];
                this.s[b - this.a[this.a[144] + n]] = this.a[0][this.au][this.a[this.a[143] + b]];
                ++this.ar;
            }
            this.at = 9;
            return;
        }
        if (this.e[8749 + this.q] == 6) {
            if (this.k > 0) {
                if (this.e[3636 + this.k] > 0) {
                    this.r[this.ar] = 29;
                    ++this.ar;
                }
            }
            else if (this.F != -1) {
                for (int n2 = 0; this.a[this.F][n2] != 0; n2 = (byte)(n2 + 1)) {
                    if (this.e[3636 + this.a[this.F][n2]] > 0) {
                        this.r[this.ar] = 29;
                        ++this.ar;
                        break;
                    }
                }
            }
            this.a[0][6] = (short)(this.a[0][3] / 5);
            if (this.a[0][6] > this.at) {
                this.a[0][6] = this.at;
            }
            for (byte b2 = 0; b2 < 6; ++b2) {
                if (this.a[0][5 + b2] > 0) {
                    this.r[this.ar] = b2;
                    this.s[this.ar] = (byte)this.a[0][5 + b2];
                    ++this.ar;
                }
            }
            return;
        }
        if (this.e[8749 + this.q] == 8) {
            for (int i = 0; i < this.e[9115 + this.q] * 2; i = (byte)(i + 1)) {
                this.r[this.ar] = (byte)(19 + i);
                ++this.ar;
            }
        }
    }
    
    private void ab() {
        for (int i = 0; i < 8; i = (byte)(i + 1)) {
            this.j[i] = 0;
        }
        byte b = 0;
        int n = 0;
        if (this.e[8810 + this.q] > 0 && (this.e[8749 + this.q] != 2 || this.e[8627 + this.q] != 0)) {
            this.j[0] = this.e[8810 + this.q];
            ++n;
            b = 1;
        }
        for (byte b2 = this.e[8993 + this.q]; b2 > 0; b2 = this.e[4545 + b2]) {
            if (this.e[1313 + b2] > 0 && (this.e[8810 + this.q] != b2 || (this.e[8749 + this.q] == 2 && this.e[8627 + this.q] == 0))) {
                this.j[b + this.e[4646 + b2]] = b2;
                ++n;
            }
        }
        int n2 = 0;
        for (int j = 0; j < n; j = (byte)(j + 1)) {
            while (this.j[n2] == 0) {
                n2 = (byte)(n2 + 1);
            }
            this.r[this.ar] = (byte)(-this.j[n2]);
            ++this.ar;
            n2 = (byte)(n2 + 1);
        }
    }
    
    private void ac() {
        if (this.e[8627 + this.q] == 2) {
            this.r[this.ar] = 28;
            ++this.ar;
        }
        else if (this.e[8627 + this.q] != 1 && this.e[8749 + this.q] < 12 && this.e[9115 + this.q] < this.f[this.e[8749 + this.q]]) {
            this.r[this.ar] = 16;
            ++this.ar;
        }
        if (this.e[8627 + this.q] == 1) {
            this.r[this.ar] = 27;
            ++this.ar;
        }
        else if (this.e[8505 + this.q] < this.e[8566 + this.q] && this.e[8749 + this.q] < 12) {
            this.r[this.ar] = 26;
            ++this.ar;
        }
        this.r[this.ar] = 17;
        ++this.ar;
    }
    
    private void ad() {
        if (!this.F) {
            if (this.q != 3) {
                this.r[this.ar] = 10;
                ++this.ar;
            }
            this.r[this.ar] = (byte)(this.N ? 15 : 12);
            ++this.ar;
            if (!this.N) {
                this.r[this.ar] = (byte)(this.L ? 14 : 11);
                ++this.ar;
            }
            this.r[this.ar] = 13;
            ++this.ar;
            this.r[this.ar] = (byte)(this.aq + 23);
            ++this.ar;
            return;
        }
        this.aq = 1;
        while (this.aq <= 50) {
            if (this.e[1919 + this.aq] > 0 && this.e[1414 + this.aq] >= 12) {
                this.r[this.ar] = (byte)(-this.aq);
                ++this.ar;
            }
            ++this.aq;
        }
        if (!this.K) {
            this.aq = 1;
            while (this.aq <= 50) {
                if (this.e[1919 + this.aq] > 0 && this.e[1414 + this.aq] < 12) {
                    this.r[this.ar] = (byte)(-this.aq);
                    ++this.ar;
                }
                ++this.aq;
            }
        }
        this.a(false, false, false, true, true, false, false, false, false);
    }
    
    private void ae() {
        if (this.n > 1) {
            this.n = 0;
            return;
        }
        if (this.g && this.j != 1) {
            if (this.as >= 0) {
                if (this.as > 0) {
                    --this.as;
                }
                if (this.as < this.aX) {
                    --this.aX;
                }
                this.V = false;
                this.ai();
            }
        }
        else if (this.h && this.j != 1) {
            if (this.as < this.ar - 1) {
                if (this.as >= this.aW - 1 && this.as - this.aX == this.aW - 1) {
                    ++this.aX;
                }
                ++this.as;
                this.V = false;
                this.ai();
            }
        }
        else if (this.e && this.S) {
            if (this.a[6]) {
                if (!this.Q) {
                    --this.y;
                }
            }
            else if (this.s[this.as] < this.at) {
                final byte[] s = this.s;
                final byte as = this.as;
                ++s[as];
                this.a[0][this.au][this.r[this.as]] = this.s[this.as];
            }
        }
        else if (this.f && this.S) {
            if (this.a[6]) {
                if (!this.R) {
                    ++this.y;
                }
            }
            else if (this.s[this.as] > 0) {
                final byte[] s2 = this.s;
                final byte as2 = this.as;
                --s2[as2];
                this.a[0][this.au][this.r[this.as]] = this.s[this.as];
            }
        }
        else if (this.i || f.l) {
            this.i = false;
            f.l = false;
            this.v = false;
            this.E = 4;
            if (this.w == 4 && this.Y == 3) {
                this.l(-2);
                return;
            }
            if (this.Y == 4) {
                return;
            }
            this.af();
        }
        else if (f.m) {
            f.m = false;
            this.ah();
        }
    }
    
    private void af() {
        if (this.r[this.as] == 13) {
            this.aj();
            return;
        }
        if (this.r[this.as] < 0) {
            if (this.F) {
                if (this.k == this.l) {
                    if (this.c[this.e[101 + this.k]][this.e[0 + this.k]] != this.k) {
                        this.a(this.k, this.e[4444 + this.k], true, true);
                    }
                    if (this.K) {
                        this.a[0][17] = this.k;
                        this.K = false;
                        this.a.b((int)this.k);
                    }
                    this.d(this.k);
                    this.F = false;
                }
                this.k = this.l;
            }
            else if (this.V) {
                this.a(this.l, this.q, true, true);
                this.V = false;
            }
            else {
                this.V = true;
                this.P = true;
            }
            this.f((this.e[4646 + this.l] < 0 || this.e[2828 + this.l] == 92 || this.e[2828 + this.l] == 106) ? this.l : (-this.e[4444 + this.l]), 0);
            return;
        }
        if (this.a[6]) {
            this.aJ();
            this.l(0);
            this.s = this.a[this.a[138] + 416 + this.r[this.as]];
            return;
        }
        if (this.r[this.as] == 17) {
            this.l(3);
            return;
        }
        if (this.r[this.as] == 16 || this.r[this.as] == 26) {
            this.b(this.q, this.r[this.as] == 16);
            this.a(true, true, false, false);
            this.w = 0;
            return;
        }
        if (this.r[this.as] == 27) {
            this.e[8566 + this.q] = this.a[this.a[138] + (7 + this.e[9115 + this.q] - 1) * 26 + this.e[8749 + this.q]];
            if (this.e[8505 + this.q] > this.e[8566 + this.q]) {
                this.e[8505 + this.q] = this.e[8566 + this.q];
            }
            if (this.e[8505 + this.q] > this.a[this.a[138] + (7 + this.e[9115 + this.q] - 1) * 26 + this.e[8749 + this.q]]) {
                this.e[8505 + this.q] = this.a[this.a[138] + (7 + this.e[9115 + this.q] - 1) * 26 + this.e[8749 + this.q]];
            }
            final byte[] e = this.e;
            final int n = 9054 + this.q;
            e[n] |= 0x1;
            this.P = true;
            return;
        }
        if (this.r[this.as] == 28) {
            final byte[] e2 = this.e;
            final int n2 = 9054 + this.q;
            e2[n2] |= 0x1;
            this.P = true;
            return;
        }
        if (this.r[this.as] == 10) {
            this.a(true, false, false, false, false, true, false, false, false);
            this.P = true;
            return;
        }
        if (this.r[this.as] == 11) {
            this.M = true;
            this.l(2);
            this.s = 100;
            this.aJ();
            return;
        }
        if (this.r[this.as] == 14) {
            this.L = false;
            this.M = false;
            this.a.c();
            this.P = true;
            return;
        }
        if (this.r[this.as] == 12) {
            this.O = true;
            this.l(2);
            this.s = 100;
            this.aJ();
            return;
        }
        if (this.r[this.as] == 15) {
            this.N = false;
            this.O = false;
            this.a.c();
            this.P = true;
            return;
        }
        if (this.r[this.as] >= 23 && this.r[this.as] <= 25) {
            ++this.aq;
            if (this.aq > 2) {
                this.aq = 0;
            }
            this.P = true;
            return;
        }
        if (this.r[this.as] >= 6 && this.r[this.as] <= 8) {
            this.l(2);
            this.s = 20 + this.r[this.as] - 6;
            return;
        }
        if (this.r[this.as] < 6 || this.r[this.as] == 29) {
            this.ag();
            return;
        }
        if (this.r[this.as] >= 19 && this.w != 3) {
            this.l((this.r[this.as] == 22) ? 2 : 1);
            this.s = (byte)(this.r[this.as] - 19);
        }
    }
    
    private void ag() {
        if (this.e[8749 + this.q] == 6) {
            byte b = 3;
            if (this.r[this.as] == 29) {
                b = 2;
            }
            if (this.k > 0) {
                this.e[3131 + this.k] = (byte)(this.y + this.I);
                this.e[3232 + this.k] = (byte)(this.A + this.K);
                this.e[2828 + this.k] = (byte)(44 + this.r[this.as]);
                this.e[6161 + this.k] = b;
                this.a(false, true, false, true);
                this.w = 1;
            }
            else if (this.F != -1) {
                for (int n = 0; this.a[this.F][n] > 0; ++n) {
                    this.e[3131 + this.a[this.F][n]] = (byte)(this.y + this.I);
                    this.e[3232 + this.a[this.F][n]] = (byte)(this.A + this.K);
                    this.e[2828 + this.a[this.F][n]] = (byte)(44 + this.r[this.as]);
                    this.e[6161 + this.a[this.F][n]] = b;
                }
                this.a(true, true, false, false);
                this.w = 1;
            }
            else {
                this.l(1);
                this.s = -this.r[this.as] - 1;
            }
            this.l = this.k;
        }
    }
    
    private void ah() {
        if (this.K) {
            return;
        }
        this.P = false;
        if (this.w == 4) {
            this.l(-1);
            return;
        }
        if (this.k != 0) {
            this.w = 1;
            this.l = this.k;
            this.a(false, true, false, true);
        }
        else if (this.F != -1) {
            this.w = 1;
            this.a(true, true, false, false);
        }
        else {
            this.w = 0;
            this.a(true, true, false, false);
        }
        this.q = 0;
        this.F = false;
        this.i();
        this.V = false;
    }
    
    private void ai() {
        this.b[2] = true;
        if (this.ad == 6) {
            this.T = (this.as > 0);
            this.U = (this.as < this.ar - 1);
        }
        else {
            this.T = (this.aX > 0);
            this.U = (this.aX + this.aW < this.ar);
        }
        if (this.r[this.as] < 0) {
            this.l = (byte)(-this.r[this.as]);
            this.a(false, false, this.a[2], true, this.a[5], false, false, false, false);
        }
        else if (this.a[4]) {
            this.l = 0;
            this.a(true, false, true, false);
        }
        this.a[8] = false;
        this.a[7] = false;
        if (this.ad == 6 || (this.r[this.as] >= 6 && this.r[this.as] <= 8) || this.r[this.as] == 16) {
            this.a[8] = (this.b[8] = true);
            return;
        }
        if (this.r[this.as] >= 0 && this.r[this.as] < 6) {
            this.a[7] = (this.b[7] = true);
        }
    }
    
    private void aj() {
        this.F = true;
        final byte b = 0;
        this.as = b;
        this.aX = b;
        this.k = 0;
        while (this.e[1919 + this.l] <= 0) {
            ++this.l;
        }
        this.P = true;
    }
    
    private void l(final int y) {
        this.Y = y;
        if (this.Y > -1) {
            this.d[4] = (short)(33 + this.Y);
            this.k[4] = 1;
            this.x = this.w;
            this.c = new boolean[] { this.a[0], this.a[1], this.a[2], this.a[4], this.a[5], this.a[6], this.a[7], this.a[8], this.a[9] };
            if (this.Y <= 5) {
                this.a(true, false, true, false);
            }
            else {
                this.a(this.a[0], false, true, this.a[4], this.a[5], this.a[6], this.a[7], this.a[8], this.a[9]);
            }
            this.w = (byte)((this.Y >= 3) ? 4 : 3);
            this.b[2] = true;
        }
        else if (this.Y == -2) {
            this.c(this.q, true);
            this.d[4] = 0;
        }
        else {
            this.w = this.x;
            this.a(this.c[0], this.c[1], this.c[2], this.c[3], this.c[4], this.c[5], this.c[6], this.c[7], this.c[8]);
            this.d[4] = 0;
            if (this.s == 100) {
                this.ah();
            }
            else {
                this.P = true;
            }
            final boolean b = false;
            this.M = b;
            this.O = b;
        }
        this.s = 0;
    }
    
    final void d(final int n) {
        if (this.w == 2 && n == this.q) {
            this.P = true;
        }
    }
    
    final void b(final int n, final boolean b) {
        this.a.b((byte)n);
        for (byte b2 = this.e[8993 + n]; b2 > 0; b2 = this.e[4545 + b2]) {
            this.a(b2, n, false, false);
        }
        this.e[8627 + n] = (byte)(b ? 1 : 2);
        if (b) {
            this.e[8566 + n] = this.a[this.a[138] + (7 + this.e[9115 + n]) * 26 + this.e[8749 + n]];
        }
    }
    
    private void ak() {
        try {
            this.al();
            if (this.Q == 22 || this.Q == 23) {
                this.am();
            }
            else if (f.m) {
                f.m = false;
                this.an();
            }
            else if ((this.i || f.l || this.j) && this.aR <= 0 && this.aP == 0 && (this.Q < 28 || this.Q == 32)) {
                final boolean b = false;
                this.j = b;
                this.i = b;
                f.l = false;
                this.v = false;
                this.E = 4;
                if (this.Q == 32) {
                    return;
                }
                this.ao();
            }
            else if (this.e) {
                this.aB();
            }
            else if (this.f) {
                this.aC();
            }
            this.aD();
        }
        catch (final Exception ex) {}
    }
    
    private void al() {
        if (this.Q == 27 && (this.i || f.l)) {
            this.i = false;
            f.l = false;
            this.v = false;
            this.E = 4;
            this.i();
            this.Q = this.R;
            this.R = this.S;
            this.H = true;
            this.v = this.x;
            if (this.e > 0) {
                this.aQ();
            }
        }
    }
    
    private void am() {
        this.Q = this.R;
        this.H = true;
        if (this.T == 0) {
            this.g(this.q);
            if (this.Q == 18) {
                this.a(true, true, false, false);
                this.m = 0;
                this.Q = 28;
                this.b((int)this.a[this.a[303] + this.q]);
                this.Q = 18;
            }
            return;
        }
        if (this.T == 1) {
            if (this.u > 0 && this.u < 41) {
                ++this.t;
            }
            if (!this.e((this.q < 7) ? 1 : 2)) {
                if (this.q < 7) {
                    this.t = -1;
                }
                else {
                    this.W = false;
                }
                this.v = 66;
            }
            else {
                this.v = 67;
                this.e(0);
            }
            this.R = (byte)((this.q < 7) ? ((this.t > -1) ? 10 : 11) : (this.W ? 10 : 11));
            this.A = true;
            this.v = 1;
            this.n();
            this.u();
            this.v = 0;
            return;
        }
        if (this.T == 2 && !this.d((this.q < 7) ? 1 : 2)) {
            this.R = this.Q;
            this.T = 0;
            this.Q = 23;
        }
    }
    
    private void an() {
        if (this.Q == 32) {
            this.Q = this.U;
            this.H = true;
            return;
        }
        if (this.a[this.a[153] + 29 + this.Q] == 1) {
            if (this.Q == 25) {
                this.l(-1);
                this.P = false;
                this.I = false;
            }
            this.Q = 28;
        }
        else if (this.Q == this.U) {
            this.R = this.Q;
            this.Q = 30;
        }
        else if (this.Q == 20) {
            if (this.a[this.a[153] + 145 + 20] == 0) {
                this.z = this.y;
                this.B = this.A;
                this.J = this.I;
                this.L = this.K;
                this.Q = 28;
                this.a(this.d[0], this.d[1], this.d[2], this.d[3], this.d[4], this.d[5], this.d[6], this.d[7], this.d[8]);
            }
        }
        else if (this.Q == 16 && this.v == 60) {
            this.T = 0;
            this.Q = 22;
            this.v = 69;
            this.R = 18;
        }
        else if (this.Q == 2) {
            this.Q = this.U;
            this.Z = 0;
        }
        else if (this.Q == this.V || this.Q == 9) {
            this.Q = 13;
            this.Z = 1;
        }
        else if (this.Q == 14) {
            this.b();
        }
        else if (this.a[this.a[153] + 58 + this.Q] == 1) {
            if (this.Q == 12) {
                this.e(0);
            }
            this.Q = this.R;
            this.R = this.S;
            this.Z = this.aa;
            this.m = 0;
            this.ac = true;
        }
        else if (this.a[this.a[153] + 58 + this.Q] > 1) {
            this.Q = this.a[this.a[153] + 58 + this.Q];
            this.R = this.S;
            this.Z = this.aa;
            this.m = 0;
        }
        this.H = true;
    }
    
    private void ao() {
        final byte b = this.a[this.a[151] + this.a[this.a[152] + this.Q] + this.Z];
        if (this.af) {
            this.V = 8;
            this.r = 4;
        }
        if (this.a[this.a[153] + 87 + this.Q] == 1) {
            this.Q = this.R;
        }
        else if (this.Q == 19) {
            this.z = this.y;
            this.B = this.A;
            this.J = this.I;
            this.L = this.K;
            this.Q = 28;
        }
        else if (this.Q == 20) {
            this.ap();
        }
        else if (this.Q == 18 || this.Q == 17) {
            this.b(-1);
        }
        else if (this.Q == 15) {
            this.aq();
        }
        else if (this.Q == 16) {
            this.ar();
        }
        else if (this.Q == 12) {
            this.as();
        }
        else if (this.Q == 13) {
            this.at();
        }
        else if (this.Q == this.V) {
            this.au();
        }
        else if (this.Q == 9) {
            this.q = this.a[this.a[249] + b - 25];
            this.T = 0;
            this.Q = 22;
            this.v = 69;
            this.R = 29;
        }
        else if (this.Q == 24) {
            this.av();
        }
        else if (this.Q == 25) {
            ++this.Z;
            if (this.Z >= this.a[this.a[307] + this.m]) {
                this.Z = 0;
            }
            this.d[4] = (short)(33 + this.a[this.a[305] + this.a[this.a[306] + this.m] + this.Z]);
            this.b[2] = true;
        }
        else if (this.Q == 14) {
            f.a = (byte)this.Z;
            this.a.b(0);
            this.a.b(1);
            this.Q = 16;
        }
        else if (b == 6) {
            this.Q = 28;
        }
        else if (b == 0) {
            this.R = this.Q;
            this.Q = 2;
            this.aa = this.Z;
        }
        else if (b == 12) {
            this.q = 0;
            this.R = this.Q;
            if (this.s > -1) {
                this.Q = 3;
            }
            else {
                this.Q = 13;
                this.Z = 1;
            }
            this.aa = 0;
        }
        else if (b == 13) {
            this.aw();
        }
        else if (b == 10) {
            this.ax();
        }
        else if (b == 11) {
            this.Q = 31;
        }
        else if (b == 9) {
            this.ay();
        }
        else if (b == 5) {
            this.R = this.Q;
            this.Q = 30;
            this.aa = this.Z;
        }
        else if (b == 1) {
            this.az();
            this.a[this.a[153] + 116 + this.Q] = 4;
            this.m = 1;
            this.a.a(70);
        }
        else if (b == 3) {
            this.az();
            this.a[this.a[153] + 116 + this.Q] = 2;
            this.m = 0;
            this.a.a(74);
        }
        else if (b == 2) {
            this.R = this.Q;
            this.Q = 12;
            this.aa = this.Z;
            this.Z = 1;
            this.a[this.a[151] + this.a[this.a[152] + 12] + 1] = (byte)(17 + this.e / 2);
            this.a[this.a[151] + this.a[this.a[152] + 12] + 3] = (byte)(17 + this.l);
        }
        else if (b == 4) {
            this.Q = 32;
        }
        else if (b == 7) {
            this.aA();
        }
        else if (b == 8) {
            this.R = this.Q;
            this.Q = 16;
            this.aa = this.Z;
            this.v = 63;
        }
        this.H = true;
    }
    
    private void ap() {
        if (this.a[this.a[153] + 145 + 20] == 0) {
            if (this.ap == 14 || this.ap == 15) {
                this.e((int)this.am);
                this.f((int)this.am);
                this.a.v = this.am;
                this.a.u = 0;
                if (this.a.a((this.ap == 14) ? 4 : 2)) {
                    this.e[6161 + this.am] = 2;
                }
            }
            else {
                this.f(this.an, 0);
            }
            this.aJ();
            if (this.w == 3) {
                this.l(-1);
                this.ah();
            }
            else {
                this.a(this.d[0], this.d[1], this.d[2], this.d[3], this.d[4], this.d[5], this.d[6], this.d[7], this.d[8]);
            }
        }
        else {
            this.a(this.d[0], this.d[1], this.d[2], this.d[3], this.d[4], this.d[5], this.d[6], this.d[7], this.d[8]);
        }
        this.z = this.y;
        this.B = this.A;
        this.J = this.I;
        this.L = this.K;
        this.Q = 28;
        if (this.K) {
            this.o = 0;
            this.aJ();
            this.l(-1);
            this.a(true, this.P = false, false, false, true, false, false, false, false);
            this.w = 2;
            this.b[4] = true;
            this.Z();
            this.aj();
        }
    }
    
    private void aq() {
        if (this.m >= 4) {
            return;
        }
        if (this.m > 0) {
            if (this.m == 3) {
                this.a[this.a[153] + 116 + this.Q] = 2;
            }
            this.a.a(70 + this.m);
            this.v = 71;
            ++this.m;
            return;
        }
        if (this.m == -1) {
            if (this.u == 41) {
                this.aM();
                if (this.q < 5) {
                    ++this.q;
                    this.T = 0;
                    this.Q = 23;
                    this.v = 69;
                    this.R = 18;
                    this.s = this.a[this.a[248] + this.q];
                    if (this.r < this.s) {
                        this.r = this.s;
                    }
                    this.V = (byte)(4 + this.r);
                    this.e(0);
                }
                else if (this.q == 6) {
                    this.c = -1;
                    this.Q = this.U;
                    this.b(59);
                    ++this.q;
                    this.Q = 18;
                }
                else {
                    this.c = -1;
                    this.Q = this.U;
                }
                this.Z = 0;
                return;
            }
            if (this.q == 1 || this.q == 6) {
                --this.q;
            }
            this.aM();
            this.R = this.U;
            this.Q = 16;
            this.v = 58;
            this.Z = 0;
            this.c = -1;
        }
    }
    
    private void ar() {
        if (this.v == 68) {
            this.b();
            return;
        }
        if (this.v == 65) {
            this.aM();
            this.Q = this.U;
            this.Z = 0;
            this.c = -1;
            this.g = 0;
            return;
        }
        if (this.v == 58) {
            this.T = 0;
            this.Q = 22;
            this.v = 69;
            this.R = (byte)((this.q < 7) ? 18 : 29);
            return;
        }
        if (this.v == 59) {
            this.e = 2;
            this.ac = true;
            this.aQ();
            final byte u = this.U;
            this.Q = u;
            this.R = u;
            return;
        }
        if (this.v == 64) {
            this.T = 1;
            this.Q = 22;
            this.v = 69;
            this.R = 21;
            return;
        }
        if (this.v == 63) {
            this.Q = 31;
            return;
        }
        if (this.v == 60) {
            this.p = 1;
            this.T = 0;
            this.Q = 22;
            this.v = 69;
            this.R = 18;
            return;
        }
        if (this.v == 62) {
            this.s = -1;
            this.t = -2;
            this.Q = 13;
            this.R = 2;
            this.Z = 1;
            this.e(0);
        }
    }
    
    private void as() {
        if (this.Z != 1) {
            if (this.Z == 3) {
                this.l = ((this.l == 0) ? 1 : 0);
                this.a[this.a[151] + this.a[this.a[152] + 12] + 3] = (byte)(17 + this.l);
            }
            return;
        }
        this.e = (byte)((this.e == 0) ? 2 : 0);
        this.a[this.a[151] + this.a[this.a[152] + 12] + 1] = (byte)(17 + this.e / 2);
        if (this.a != null) {
            this.a.a(this.e);
            return;
        }
        this.aR();
        this.aQ();
    }
    
    private void at() {
        this.b = (byte)(this.Z / 2);
        if (this.q >= 7) {
            this.Q = 9;
            this.d = this.b;
        }
        else {
            if (this.r == 0) {
                this.Q = 16;
                this.v = 60;
                this.p = 0;
                this.s = 0;
            }
            else {
                this.Q = this.V;
            }
            this.c = this.b;
            this.e(0);
        }
        this.Z = 0;
    }
    
    private void au() {
        this.q = this.a[this.a[249] + this.a[this.a[151] + this.a[this.a[152] + this.Q] + this.Z] - 25];
        this.s = this.a[this.a[248] + this.q];
        if (this.q == 0) {
            this.Q = 16;
            this.v = 60;
            this.p = 0;
        }
        else {
            this.T = 0;
            this.Q = 22;
            this.v = 69;
        }
        this.R = 18;
        this.e(0);
    }
    
    private void av() {
        this.Q = 15;
        this.Z = 0;
        this.a[this.a[153] + 116 + this.Q] = 0;
        this.a[this.a[153] + 145 + this.Q] = 2;
        this.a[this.a[153] + 58 + this.Q] = 0;
        this.a.a(75);
        this.v = 71;
        this.m = -1;
        for (int i = 0; i < 2; ++i) {
            for (short n = 0; n < 5; ++n) {
                final short[] array = this.a[i];
                final int n2 = 24;
                array[n2] += (short)(this.a[i][19 + n] * this.a[this.a[112] + n] / 10);
            }
        }
    }
    
    private void aw() {
        this.q = 7;
        this.R = this.Q;
        if (this.W) {
            this.Q = 3;
            this.Z = 0;
        }
        else if (this.r > 0 || this.af) {
            this.Q = 13;
            this.Z = 1;
        }
        else {
            this.v = 70;
            this.Q = 21;
            this.Z = 0;
        }
        this.aa = 1;
    }
    
    private void ax() {
        this.Z = 0;
        this.R = this.Q;
        if (this.q >= 7) {
            this.Q = 13;
            final int n = 1;
            this.aa = n;
            this.Z = n;
            return;
        }
        if (this.s > -1) {
            this.Q = 16;
            this.v = 62;
            return;
        }
        if (this.Q == 4) {
            this.Q = 16;
            this.v = 60;
            this.p = 0;
            return;
        }
        this.Q = this.V;
    }
    
    private void ay() {
        if (!this.X) {
            this.R = this.Q;
            this.Q = 16;
            this.v = 65;
            return;
        }
        this.aM();
        this.Q = this.U;
        this.Z = 0;
        this.c = -1;
        this.g = 0;
    }
    
    private void az() {
        this.R = this.Q;
        this.Q = 15;
        this.aa = this.Z;
        this.v = 71;
        this.a[this.a[153] + 145 + this.Q] = 0;
        this.a[this.a[153] + 58 + this.Q] = 1;
    }
    
    private void aA() {
        this.R = this.Q;
        this.aa = this.Z;
        this.X = true;
        Label_0061: {
            if (this.q < 7) {
                if (this.t <= -1) {
                    break Label_0061;
                }
            }
            else if (!this.W) {
                break Label_0061;
            }
            this.Q = 16;
            this.v = 64;
            return;
        }
        this.T = 1;
        this.Q = 22;
        this.v = 69;
        this.R = 21;
    }
    
    private void aB() {
        if (this.a[this.a[153] + 174 + this.Q] == 1) {
            if (!this.Q) {
                --this.y;
            }
        }
        else {
            if (this.Q == 12) {
                --this.Z;
            }
            else if (this.Q == 13 && this.Z == 1) {
                --this.Z;
            }
            this.Z = ((this.Z > 0) ? (this.Z - 1) : (this.ab - 1));
        }
    }
    
    private void aC() {
        if (this.a[this.a[153] + 174 + this.Q] == 1) {
            if (!this.R) {
                ++this.y;
            }
        }
        else {
            this.Z = ((this.Z < this.ab - 1) ? (this.Z + 1) : 0);
            if (this.Q == 12) {
                this.Z = this.Z / 2 * 2 + 1;
                return;
            }
            if (this.Q == 13 && this.Z == 0) {
                ++this.Z;
            }
        }
    }
    
    private void aD() {
        if (this.Q == 31) {
            if (this.t >= this.s || this.q >= 7) {
                this.T = 2;
                this.Q = 22;
                this.v = 69;
                this.R = 28;
            }
            else {
                this.q = this.s;
                if (this.q >= 1) {
                    ++this.q;
                }
                this.T = 0;
                this.Q = 22;
                this.v = 69;
                this.R = 18;
            }
            this.b = this.c;
        }
        if (this.Q == 28) {
            this.a(this.a[0], this.a[1], this.a[2], this.a[4], this.a[5], this.a[6], this.a[7], this.a[8], this.a[9]);
            this.c = false;
            this.y = this.z;
            this.A = this.B;
            this.I = this.J;
            this.K = this.L;
            this.A = true;
            this.v = 1;
            this.i();
            return;
        }
        if (this.Q == 19) {
            this.Y();
            this.E();
            return;
        }
        if (this.Q == 30) {
            this.Q = 16;
            this.v = 68;
            this.H = true;
            return;
        }
        if (this.Q == 29) {
            this.a(true, true, false, false);
            this.A = true;
            this.Q = 28;
        }
    }
    
    private void aE() {
        ++this.F;
        if (this.F > 4) {
            this.u = true;
            this.t = false;
            this.F = 0;
            this.F = 4;
            this.k = 0;
            this.a(true, true, false, false);
            this.q = 0;
            this.G = this.y + this.I;
            this.H = this.A + this.K;
            this.aI();
        }
    }
    
    private void aF() {
        this.u = false;
        this.t = false;
        this.aI();
        this.L = 0;
        this.K = this.C + 1;
        while (this.K <= this.C + this.E) {
            this.J = this.B + 1;
            while (this.J <= this.B + this.D) {
                this.H = this.c[this.K][this.J];
                if (this.H >= 1 && this.H <= 50 && this.e[1919 + this.H] > 0) {
                    if (this.L < 50) {
                        this.a[4][this.L] = this.H;
                        this.e[909 + this.H] = 4;
                    }
                    ++this.L;
                }
                ++this.J;
            }
            ++this.K;
        }
        if (this.a[4][0] == 0) {
            this.w = 0;
            this.k = 0;
            this.F = -1;
        }
        else if (this.a[4][1] == 0) {
            this.e[909 + this.a[4][0]] = 0;
            this.d(this.a[4][0]);
            this.a[4][0] = 0;
            this.F = -1;
        }
        else {
            this.F = 4;
            this.w = 1;
            this.M = this.L;
            if (this.M > 50) {
                this.M = 50;
            }
        }
        final int n = 0;
        this.E = n;
        this.D = n;
        this.C = n;
        this.B = n;
    }
    
    private void aG() {
        this.w = false;
        this.I = 0;
        switch (this.i) {
            case 7: {
                this.G = 2;
                break;
            }
            case 9: {
                this.G = 3;
                break;
            }
            default: {
                return;
            }
        }
        this.L = 0;
        while (this.L < 50) {
            this.H = (byte)((this.F != -1) ? this.a[this.F][this.L] : ((this.L == 0) ? this.k : 0));
            this.a[0][this.L] = this.H;
            this.e[909 + this.a[this.G][this.L]] = 0;
            this.a[this.G][this.L] = 0;
            ++this.L;
        }
        this.L = 0;
        while (this.L < 50) {
            this.H = this.a[0][this.L];
            if (this.H != 0) {
                this.e((int)this.H);
                this.a[this.G][this.L] = this.H;
                this.e[909 + this.H] = this.G;
            }
            ++this.L;
        }
        this.w = 1;
        this.F = this.G;
        this.k = 0;
        this.a(true, true, false, false);
    }
    
    private void aH() {
        this.w = false;
        this.I = 0;
        switch (this.i) {
            case 7: {
                this.G = 2;
                break;
            }
            case 9: {
                this.G = 3;
                break;
            }
            default: {
                return;
            }
        }
        if (this.F == this.G) {
            this.f(this.a[this.F][0], 0);
            return;
        }
        if (this.a[this.G][0] != 0) {
            this.F = this.G;
            this.aI();
            this.M = 0;
            this.L = 0;
            while (this.L < 50) {
                if (this.a[this.F][this.L] != 0) {
                    this.e[909 + this.a[this.F][this.L]] = this.F;
                    ++this.M;
                }
                ++this.L;
            }
            this.w = 1;
            this.k = 0;
            this.a(true, true, false, false);
        }
    }
    
    final void e(final int n) {
        for (short n2 = 0; n2 < 5; ++n2) {
            final byte b;
            if ((b = (byte)((n2 < 4) ? this.a[this.a[125] + n2] : 4)) != -1) {
                for (int i = 0; i < 50; ++i) {
                    if (this.a[b][i] == n) {
                        while (i < 50) {
                            this.a[b][i] = (byte)((i < 49) ? this.a[b][i + 1] : 0);
                            ++i;
                        }
                        if (this.a[b][0] == 0 && this.F == this.e[909 + n]) {
                            if (this.w == 1) {
                                this.w = 0;
                            }
                            this.F = -1;
                        }
                        this.e[909 + n] = 0;
                        return;
                    }
                }
            }
        }
    }
    
    private void aI() {
        for (int i = 0; i < 50; ++i) {
            if (this.a[4][i] != 0) {
                this.e[909 + this.a[4][i]] = 0;
                this.a[4][i] = 0;
            }
        }
    }
    
    private void aJ() {
        if (this.u) {
            this.u = false;
            this.F = -1;
            this.k = 0;
            final int n = 0;
            this.E = n;
            this.D = n;
            this.C = n;
            this.B = n;
        }
    }
    
    private void aK() {
        this.y = this.C;
        this.A = this.D;
        while (this.I < 0) {
            ++this.I;
        }
        while (this.K < 0) {
            if (this.s) {
                break;
            }
            ++this.K;
        }
        while (this.I + this.O > this.c - 1) {
            --this.I;
        }
        while (this.K + this.P >= this.d - 1) {
            --this.K;
        }
    }
    
    private void aL() {
        if (this.w) {
            ++this.I;
            if (this.I > 10) {
                this.w = false;
                this.I = 0;
            }
        }
    }
    
    private static byte a(final int n) {
        if (n >= 1 && n <= 50) {
            return 0;
        }
        if (n >= 51 && n <= 100) {
            return 1;
        }
        return 2;
    }
    
    final byte a(final byte b, final byte b2, final byte b3, final byte b4, final byte b5) {
        byte b6;
        byte b7;
        for (b6 = (byte)(1 + b * 50), b7 = 0; this.e[1919 + b6 + b7] != 0; ++b7) {}
        if (b7 >= 50) {
            return -1;
        }
        final byte b8 = (byte)(b7 + b6);
        if (this.F) {
            this.P = true;
        }
        final byte[] e = this.e;
        final int n = 0 + b8;
        final byte[] e2 = this.e;
        final int n2 = 6262 + b8;
        this.e[3131 + b8] = b2;
        e[n] = (e2[n2] = b2);
        final byte[] e3 = this.e;
        final int n3 = 101 + b8;
        final byte[] e4 = this.e;
        final int n4 = 6363 + b8;
        this.e[3232 + b8] = b3;
        e3[n3] = (e4[n4] = b3);
        this.e[202 + b8] = (this.e[303 + b8] = 0);
        this.e[808 + b8] = 0;
        this.e[909 + b8] = 0;
        this.e[1111 + b8] = 0;
        this.e[4949 + b8] = (byte)(4 + (b5 & 0x7));
        this.e[606 + b8] = 3;
        this.e[1313 + b8] = 0;
        this.e[1414 + b8] = b4;
        this.e[1616 + b8] = (byte)((b5 & 0x7) * 2 + this.a(255, 2));
        this.e[1717 + b8] = (byte)((b5 & 0x7) * 2 + this.a(255, 2));
        this.e[1818 + b8] = (byte)(3 + (b5 & 0x7));
        this.e[2020 + b8] = (byte)(50 + 25 * (1 - b) + this.a(255, 25));
        this.e[2121 + b8] = (byte)(50 + 25 * (1 - b) + this.a(255, 25));
        this.e[505 + b8] = (byte)(50 + 25 * (1 - b) + this.a(255, 25));
        final int n5 = ((b5 & 0x20) != 0x0) ? 3 : 0;
        final int a = this.a(255, 3);
        final int a2 = this.a(255, 3);
        this.e[6969 + b8] = (byte)((a == 0) ? (2 + this.a(255, 2 + n5)) : 1);
        this.e[7070 + b8] = (byte)((a == 1) ? (2 + this.a(255, 2 + n5)) : 1);
        this.e[7272 + b8] = (byte)((a == 2) ? (2 + this.a(255, 2 + n5)) : 1);
        this.e[7171 + b8] = (byte)((a2 == 0) ? (2 + this.a(255, 2 + n5)) : 1);
        this.e[7373 + b8] = (byte)((a2 == 1) ? (2 + b + this.a(255, 2 + n5)) : (1 + b));
        this.e[7474 + b8] = (byte)((a2 == 2) ? (2 + this.a(255, 2 + n5)) : 1);
        this.e[7575 + b8] = (byte)(1 + (b5 >> 3 & 0x3) * 3 + this.a(255, 3));
        this.e[6464 + b8] = 69;
        this.e[3434 + b8] = -1;
        this.e[3535 + b8] = 0;
        this.e[3636 + b8] = 0;
        this.e[3737 + b8] = (byte)(2 + this.a(255, 2));
        this.e[3838 + b8] = b8;
        this.e[4545 + b8] = 0;
        this.e[4646 + b8] = -1;
        this.e[4747 + b8] = b8;
        this.e[4848 + b8] = 0;
        this.e[5151 + b8] = (byte)(this.a(15, 4) << 2 | this.a(255, 3));
        if ((this.a[b][12] <= this.a[b][13] || this.aw == 0) && this.aw != 1) {
            this.e[1515 + b8] = 0;
            final short[] array = this.a[b];
            final int n6 = 12;
            ++array[n6];
        }
        else {
            this.e[1515 + b8] = 1;
            final short[] array2 = this.a[b];
            final int n7 = 13;
            ++array2[n7];
        }
        if (b4 < 12) {
            this.e[2828 + b8] = 17;
            this.e[2929 + b8] = 14;
            this.e[6767 + b8] = (this.e[1919 + b8] = (byte)(5 + this.a(255, 10)));
            this.e[1010 + b8] = 8;
        }
        else {
            this.e[2828 + b8] = 69;
            this.e[2929 + b8] = 8;
            this.e[6767 + b8] = (this.e[1919 + b8] = (byte)(((this.q == 0 && b == 1) ? 20 : 40) + (this.e[1515 + b8] - 1) * -10 + this.a(255, 15)));
            this.e[1010 + b8] = (byte)(((b5 & 0x7) == 0x0) ? 8 : (9 - (b5 & 0x7)));
        }
        this.e[4444 + b8] = b8;
        this.e[6565 + b8] = 9;
        if ((b5 & 0x40) != 0x0) {
            this.e[6565 + b8] = (byte)this.a(255, 4 + b * 2);
        }
        if (this.q == 3) {
            this.e[6565 + b8] = 0;
        }
        if ((this.q == 4 || this.q == 5) && this.e[6565 + b8] == 1) {
            this.e[6565 + b8] = 3;
        }
        this.e[3333 + b8] = -1;
        this.e[7979 + b8] = (this.e[8282 + b8] = 0);
        this.e[8080 + b8] = 0;
        final byte[] e5 = this.e;
        final int n8 = 2222 + b8;
        final byte[] e6 = this.e;
        final int n9 = 2323 + b8;
        final byte[] e7 = this.e;
        final int n10 = 2424 + b8;
        final byte[] e8 = this.e;
        final int n11 = 2525 + b8;
        final byte[] e9 = this.e;
        final int n12 = 2626 + b8;
        final byte b9 = 0;
        e9[n12] = b9;
        e7[n10] = (e8[n11] = b9);
        e5[n8] = (e6[n9] = b9);
        this.g((int)b8);
        this.b(b8);
        if (this.c[b3][b2] == 0) {
            this.c[b3][b2] = b8;
        }
        if (!this.s) {
            final short[] array3 = this.a[b];
            final int n13 = 11;
            ++array3[n13];
            if (b == 0) {
                this.a((byte)1, b2, b3, b8);
            }
            final short[] array4 = this.a[b];
            final int n14 = 19;
            ++array4[n14];
        }
        if (b == 0) {
            this.a.a((int)this.e[0 + b8], (int)this.e[101 + b8], (int)this.e[4949 + b8]);
        }
        return b8;
    }
    
    final void a(final byte b) {
        final byte b2 = (byte)((b - 1) / 50);
        final int n = this.e[0 + b] + this.a[this.a[1] + this.e[606 + b]];
        final int n2 = this.e[101 + b] + this.a[this.a[1] + 8 + this.e[606 + b]];
        if ((this.e[2929 + b] & 0xFF) <= 7 && (this.e[1111 + b] & 0xF) < (this.a[this.a[15] + (this.e[606 + b] & 0x1) * 9 + this.e[1010 + b] - this.e[7777 + b]] + 1) / 2 && this.c[n2][n] == -128) {
            this.c[n2][n] = (byte)((this.e[4545 + b] >= 111) ? (-this.e[4545 + b]) : 0);
        }
        this.e((int)b);
        this.f((int)b);
        this.e[1919 + b] = -1;
        this.c((int)b);
        if (this.F || b == this.e[8810 + this.q]) {
            this.P = true;
        }
        if (!this.s) {
            if (b2 == 0) {
                this.a((byte)3, this.e[0 + b], this.e[101 + b], b);
            }
            final short[] array = this.a[1 - b2];
            final int n3 = 22;
            ++array[n3];
        }
    }
    
    private void f(final int n, final int n2) {
        this.J = this.I;
        this.L = this.K;
        if (n > 100) {
            this.I = (byte)(this.e[9359 + n - 101] - this.C);
            this.K = (byte)(this.e[9381 + n - 101] - this.D + n2);
        }
        else if (n > 0) {
            this.I = (byte)(this.e[0 + n] - this.C);
            this.K = (byte)(this.e[101 + n] - this.D + n2);
        }
        else if (n == -100) {
            this.I -= this.C;
            this.K -= (byte)(this.D - n2);
        }
        else {
            if (n >= 0) {
                return;
            }
            this.I = (byte)(this.e[8383 + -n] + (this.a[this.a[138] + 104 + this.e[8749 + -n]] >> 1) - this.C);
            this.K = (byte)(this.e[8444 + -n] + (this.a[this.a[138] + 130 + this.e[8749 + -n]] >> 1) - this.D + n2);
        }
        this.aK();
        this.A = true;
    }
    
    final void b(int n, int n2) {
        for (int i = 1; i <= 50; i = (byte)(i + 1)) {
            if (this.e[1919 + i] > 0) {
                this.c[this.e[101 + i]][this.e[0 + i]] = 0;
            }
        }
        for (byte b = 1; b <= 50; ++b) {
            if (this.e[1919 + b] > 0) {
                if (this.c[n2][n] != 0) {
                    this.a.v = 0;
                    this.a.a(1, 127, n, n2);
                    n = this.e[3131];
                    n2 = this.e[3232];
                }
                if ((this.e[2929 + b] & 0xFF) <= 7 && (this.e[1111 + b] & 0xF) < (this.a[this.a[15] + (this.e[606 + b] & 0x1) * 9 + this.e[1010 + b] - this.e[7777 + b]] + 1) / 2 && this.c[this.e[101 + b] + this.a[this.a[1] + 8 + this.e[606 + b]]][this.e[0 + b] + this.a[this.a[1] + this.e[606 + b]]] == -128) {
                    this.c[this.e[101 + b] + this.a[this.a[1] + 8 + this.e[606 + b]]][this.e[0 + b] + this.a[this.a[1] + this.e[606 + b]]] = 0;
                }
                final byte[] e = this.e;
                final int n3 = 0 + b;
                final byte[] e2 = this.e;
                final int n4 = 6262 + b;
                final byte[] e3 = this.e;
                final int n5 = 3131 + b;
                final byte b2 = (byte)n;
                e3[n5] = b2;
                e[n3] = (e2[n4] = b2);
                final byte[] e4 = this.e;
                final int n6 = 101 + b;
                final byte[] e5 = this.e;
                final int n7 = 6363 + b;
                final byte[] e6 = this.e;
                final int n8 = 3232 + b;
                final byte b3 = (byte)n2;
                e6[n8] = b3;
                e4[n6] = (e5[n7] = b3);
                this.e[202 + b] = (this.e[303 + b] = 0);
                this.e[808 + b] = 0;
                this.e[2828 + b] = 69;
                this.e[2929 + b] = 8;
                this.e[3030 + b] = 0;
                this.e[6161 + b] = 0;
                this.c[this.e[101 + b]][this.e[0 + b]] = b;
                this.a.a((int)this.e[0 + b], (int)this.e[101 + b], (int)this.e[4949 + b]);
            }
        }
    }
    
    final void f(final int n) {
        if (this.k == n) {
            this.k = 0;
            if (this.w == 1) {
                this.w = 0;
                this.l = 0;
                this.a(true, true, false, false);
                return;
            }
            if (this.w == 2 && this.e[8749 + this.q] == 6) {
                this.w = 0;
                this.a(true, true, false, false);
            }
        }
    }
    
    final void b(final byte b) {
        int n = 2;
        if (b >= 51) {
            n = ((b == 51) ? 4 : 3);
        }
        else if (this.e[1414 + b] < 12) {
            n = 0;
        }
        else if (this.e[1414 + b] < 35) {
            n = 1;
        }
        this.e[2727 + b] = (byte)(this.a[this.a[189] + this.e[1515 + b] * 10 + n * 2] + this.a(255, (int)this.a[this.a[189] + this.e[1515 + b] * 10 + n * 2 + 1]));
        if (b == this.l) {
            this.b[4] = this.a[4];
        }
    }
    
    final void g(final int n) {
        this.e[6868 + n] = (byte)((n == 51 || n == 52) ? -2 : ((n > 51) ? -1 : ((byte)(((n > 3) ? (1 + this.a(65535, 58)) : n) % 60 + 60 * this.e[1515 + n] - 1))));
    }
    
    private static byte b(final int n) {
        if (n <= -1 && n >= -30) {
            return 0;
        }
        if (n <= -31 && n >= -60) {
            return 1;
        }
        return 2;
    }
    
    final byte a(final byte b, final int n, final int n2, final int n3, int n4, final boolean b2, final int n5) {
        final byte b3 = this.a[this.a[138] + 104 + n];
        final byte b4 = this.a[this.a[138] + 130 + n];
        final byte b5 = (byte)(1 + b * 30);
        byte b6 = 0;
        try {
            while (this.e[8505 + b5 + b6] != 0) {
                ++b6;
            }
            if (b6 >= 30) {
                if (b == 0) {
                    this.s = 100;
                    this.l(-1);
                    this.a((byte)10, this.u[0] = 0, (byte)0, (byte)0);
                }
                return -1;
            }
            byte b7 = (byte)(b6 + b5);
            if (n5 == -1) {
                if (!this.a(n, n2, n3, !b2)) {
                    return -2;
                }
            }
            else {
                b7 = (byte)n5;
            }
            if (n < 20 || n > 22) {
                if (n == 0) {
                    int n6 = 0;
                    while (this.a[b][n6][11] != 0) {
                        if ((n6 = (byte)(n6 + 1)) > 10) {
                            return -1;
                        }
                    }
                    this.a[b][n6][11] = b7;
                }
                this.c(n2, n3, b3, b4);
                this.e[8383 + b7] = (byte)n2;
                this.e[8444 + b7] = (byte)n3;
                this.e[8749 + b7] = (byte)n;
                this.e[8871 + b7] = 0;
                this.e[9176 + b7] = 0;
                this.e[8932 + b7] = 0;
                this.e[8993 + b7] = 0;
                this.e[9054 + b7] = 0;
                if (n4 == 0) {
                    n4 = this.a[this.a[113] + ((this.q < 2) ? 0 : ((this.q == 2) ? 12 : 24)) + n];
                }
                this.e[9115 + b7] = (byte)n4;
                this.e[8810 + b7] = 0;
                this.e[8688 + b7] = 5;
                this.e[8627 + b7] = 0;
                this.e[8505 + b7] = (this.e[8566 + b7] = this.a[this.a[138] + 182 + n]);
                if (n >= 12 && n <= 19) {
                    if (!this.a.a(b7)) {
                        if (b == 0) {
                            this.s = 100;
                            this.l(-1);
                            this.a((byte)10, this.u[0] = 0, (byte)0, (byte)0);
                        }
                        this.e[8505 + b7] = 0;
                        return -1;
                    }
                    this.e[9237 + b7] = (byte)((b == 0) ? this.r[this.as] : this.a.v);
                    this.e[8566 + b7] = this.a[this.a[138] + 182 + this.e[9237 + b7]];
                    this.e[9115 + b7] = 3;
                }
                else if (b == 0) {
                    this.a.a(this.e[8383 + b7] + this.a[this.a[138] + 104 + this.e[8749 + b7]] / 2, this.e[8444 + b7] + this.a[this.a[138] + 130 + this.e[8749 + b7]] / 2, this.e[8688 + b7] & 0xF);
                }
                for (byte b8 = 0; b8 < b4; ++b8) {
                    for (byte b9 = 0; b9 < b3; ++b9) {
                        this.c[n3 + b8][n2 + b9] = (byte)(-b7);
                    }
                }
                if (n == 2) {
                    final short[] array = this.a[b];
                    final int n7 = 16;
                    array[n7] += 4;
                    if (this.a[b][16] > 50) {
                        this.a[b][16] = 50;
                    }
                }
                if (!this.s && n5 == -1) {
                    final short[] array2 = this.a[b];
                    final int n8 = 14;
                    ++array2[n8];
                    final short[] array3 = this.a[b];
                    final int n9 = 20;
                    ++array3[n9];
                }
                if (n == 2) {
                    this.a.a((int)b7);
                }
                if (b2 && b == 0) {
                    this.a((byte)5, (byte)n2, (byte)n3, (byte)0);
                }
                return b7;
            }
            byte b10;
            if (n5 == -1) {
                for (b10 = 0; b10 < 30; ++b10) {
                    if (this.f[0][b10] == 0) {
                        break;
                    }
                }
            }
            else {
                b10 = (byte)n5;
            }
            if (b10 == 30) {
                return -1;
            }
            this.f[0][b10] = (byte)this.q;
            this.f[2][b10] = (byte)n2;
            this.f[3][b10] = (byte)n3;
            this.f[1][b10] = (byte)n;
            if (!b2) {
                final byte[] array4 = this.a[0][this.au];
                final int n10 = 6 + this.s - 20;
                ++array4[n10];
                this.c[n3][n2] = (byte)((b == 0) ? -123 : -126);
            }
            else {
                this.c[n3][n2] = (byte)(20 - n - 111 - b * 6);
            }
            this.c(n2, n3, 1, 1);
            return b10;
        }
        catch (final Exception ex) {
            return -1;
        }
    }
    
    final void c(final int n, final boolean b) {
        final byte b2 = this.e[8749 + n];
        final byte b3 = this.e[8383 + n];
        final byte b4 = this.e[8444 + n];
        final byte b5 = this.a[this.a[138] + 104 + b2];
        final byte b6 = this.a[this.a[138] + 130 + b2];
        final int n2 = (n >= 31) ? 1 : 0;
        if (b2 == 2) {
            this.a.a(n);
        }
        try {
            if (b) {
                this.f((n == 1) ? -1 : 0, 0);
                this.e[8505 + n] = -1;
                this.a(n, 3);
                for (byte b7 = this.e[8993 + n]; b7 > 0; b7 = this.e[4545 + b7]) {
                    this.a(b7, n, true, false);
                }
                if (this.e[8810 + n] > 1 && (this.e[8749 + n] != 2 || this.e[8627 + n] != 0)) {
                    this.a(this.e[8810 + n], n, true, false);
                }
                if ((this.w == 2 || this.w == 4) && n == this.q) {
                    this.w = 0;
                    this.q = 0;
                    this.a(true, true, false, false);
                }
            }
            else {
                this.e[8505 + n] = 0;
                this.e[8627 + n] = 3;
                for (byte b8 = 0; b8 < b6; ++b8) {
                    for (byte b9 = 0; b9 < b5; ++b9) {
                        this.c[b4 + b8][b3 + b9] = 0;
                    }
                }
                if (b2 == 2) {
                    final short[] array = this.a[n2];
                    final int n3 = 16;
                    array[n3] -= 4;
                    if (this.a[n2][16] < 0) {
                        this.a[n2][16] = 1;
                    }
                    for (int i = n2 * 50 + 1; i <= (n2 + 1) * 50; ++i) {
                        if (this.e[3434 + i] == n) {
                            this.e[3434 + i] = 0;
                        }
                    }
                }
                if (!this.s) {
                    final short[] array2 = this.a[n2];
                    final int n4 = 14;
                    --array2[n4];
                    final short[] array3 = this.a[1 - n2];
                    final int n5 = 21;
                    ++array3[n5];
                }
                if (b2 == 0) {
                    int n6 = 0;
                    while (this.a[n2][n6][11] != n) {
                        if ((n6 = (byte)(n6 + 1)) >= 10) {
                            n6 = (byte)(n6 - 1);
                            break;
                        }
                    }
                    this.a[n2][n6][11] = 0;
                }
                this.a.c(n);
                if (n2 == 0) {
                    this.a((byte)8, b3, b4, (byte)0);
                }
            }
        }
        catch (final Exception ex) {}
    }
    
    private boolean a(final int n, final int n2, final int n3, final boolean b) {
        final byte b2 = this.a[this.a[138] + 104 + n];
        final byte b3 = this.a[this.a[138] + 130 + n];
        boolean b4 = true;
        for (byte b5 = 0; b5 < b3; ++b5) {
            for (byte b6 = 0; b6 < b2; ++b6) {
                if (!this.b(n2 + b6, n3 + b5) || this.c[n3 + b5][n2 + b6] != 0 || (b && this.a(n2 + b6, n3 + b5) != 0)) {
                    b4 = false;
                }
            }
        }
        return b4;
    }
    
    private void a(final int n, final int n2, boolean b, final boolean b2) {
        if (this.e[2828 + n] == 93 || this.e[2828 + n] == 92 || this.e[2828 + n] == 106) {
            b = true;
        }
        if (this.e[8810 + n2] == n && (this.e[8749 + n2] != 2 || this.e[8627 + n2] != 0)) {
            if (b) {
                this.e[8810 + n2] = 0;
            }
            this.d(n2);
            Label_0298: {
                if (this.c[this.e[101 + n]][this.e[0 + n]] != n) {
                    if (b) {
                        this.e[6161 + n] = 2;
                        break Label_0298;
                    }
                    this.e[2828 + n] = 87;
                }
                else {
                    this.e[3131 + n] = this.e[0 + n];
                    this.e[3232 + n] = this.e[101 + n];
                    if (b) {
                        this.e[6262 + n] = this.e[0 + n];
                        this.e[6363 + n] = this.e[101 + n];
                    }
                    this.e[2828 + n] = 69;
                    if (b) {
                        this.e[6161 + n] = 2;
                        this.e[4747 + n] = 0;
                        break Label_0298;
                    }
                }
                this.e[6161 + n] = 3;
            }
            if (b2) {
                this.a(n2, false);
            }
        }
        else {
            if (!b || (this.e[8627 + n2] == 0 && (this.e[8749 + n2] == 2 || this.e[8749 + n2] == 7 || this.e[8749 + n2] == 4 || this.e[8749 + n2] == 8))) {
                this.e[2828 + n] = 87;
                this.e[6161 + n] = 3;
                return;
            }
            this.e[6161 + n] = 2;
        }
    }
    
    final void h(final int n) {
        this.f(n);
        this.e(n);
    }
    
    final byte a(final int n, final byte b) {
        byte b2 = 1;
        int n2 = 0;
        if (n >= 51) {
            b2 = 31;
            n2 = 1;
        }
        while (b2 < 30) {
            if (this.e[8810 + b2 + 0] == n) {
                b2 += 0;
                break;
            }
            ++b2;
        }
        byte b3;
        for (b3 = 0; b3 < 30; ++b3) {
            if (this.b[n2][0][b3] == b2) {
                this.b[n2][4][b3] = b;
                break;
            }
        }
        return b3;
    }
    
    private static boolean b(final int n) {
        return n >= 101 && n <= 122;
    }
    
    final void b(final int n, final int n2, final int n3, final int n4) {
        int i = 0;
        while (i < 22) {
            if (this.e[9513 + i] == 0) {
                if (this.q != 3) {
                    final byte[] t = this.t;
                    ++t[n4];
                    break;
                }
                break;
            }
            else {
                i = (byte)(i + 1);
            }
        }
        this.e[9513 + i] = this.a[this.a[180] + n];
        this.e[9535 + i] = (byte)n;
        this.e[9359 + i] = (this.e[9645 + i] = (byte)n2);
        this.e[9381 + i] = (this.e[9667 + i] = (byte)n3);
        this.e[9403 + i] = (this.e[9425 + i] = 0);
        this.e[9711 + i] = (this.e[9689 + i] = 0);
        this.e[9601 + i] = 0;
        this.e[9491 + i] = (byte)this.a(255, 8);
        this.e[9469 + i] = (byte)n4;
        this.e[9557 + i] = this.a[this.a[184] + n];
        this.e[9579 + i] = 0;
        this.e[9447 + i] = 0;
        this.c[n3][n2] = (byte)(101 + i);
    }
    
    private static boolean c(final int n) {
        return n <= -61 && n >= -110;
    }
    
    final void a(final int n, final int n2, final int n3, final byte b) {
        int n4;
        for (n4 = 0; n4 < 50 && this.e[9833 + n4] != 0; n4 = (byte)(n4 + 1)) {}
        if (n4 == 50) {
            for (n4 = 0; this.e[9833 + n4] != 6 || this.e[9833 + n4] != 7; n4 = (byte)(n4 + 1)) {}
            this.c[this.e[9783 + n4]][this.e[9733 + n4]] = 0;
        }
        this.e[9833 + n4] = (byte)n;
        this.e[9733 + n4] = (byte)n2;
        this.e[9783 + n4] = (byte)n3;
        this.e[9883 + n4] = b;
        this.c[n3][n2] = (byte)(-61 - n4);
    }
    
    private static byte c(final int n) {
        if (n <= -111 && n >= -116) {
            return 0;
        }
        if (n <= -117 && n >= -122) {
            return 1;
        }
        if (n == -123) {
            return 3;
        }
        return 2;
    }
    
    private boolean b(final int n, final int n2) {
        return n >= 0 && n2 >= 0 && n < this.c && n2 < this.d;
    }
    
    private byte a(final int n, final int n2) {
        if ((this.a[0][n >> 5][n2] >> n & 0x1F & 0x1) == 0x0) {
            return 2;
        }
        if ((this.a[1][n >> 5][n2] >> n & 0x1F & 0x1) == 0x0) {
            return 1;
        }
        return 0;
    }
    
    final void c(final int n, final int n2, final int n3, final int n4) {
        for (int i = n2; i < n2 + n4; ++i) {
            for (int j = n; j < n + n3; ++j) {
                if (this.a(j, i)) {
                    this.a[i - this.K][j - this.I] = true;
                }
            }
        }
        this.B = true;
    }
    
    private void a(final boolean b, final boolean b2, final boolean b3, final boolean b4) {
        this.a(b, b2, b3, b4, false, false, false, false, false);
    }
    
    private void a(final boolean b, final boolean b2, final boolean b3, final boolean b4, final boolean b5, final boolean b6, final boolean b7, final boolean b8, final boolean b9) {
        this.b[0] = (this.a[0] = b);
        this.b[1] = (this.a[1] = b2);
        this.b[2] = (this.a[2] = b3);
        this.b[4] = (this.a[4] = b4);
        this.b[5] = (this.a[5] = b5);
        this.b[6] = (this.a[6] = b6);
        this.b[7] = (this.a[7] = b7);
        this.b[8] = (this.a[8] = b8);
        this.b[9] = (this.a[9] = b9);
        this.b[17] = (this.a[17] = true);
        if (b2) {
            if (this.u[0] == 0) {
                this.b[1] = (this.a[1] = true);
                this.b[9] = (this.a[9] = false);
            }
            else if (this.u[0] != 0) {
                this.b[9] = (this.a[9] = true);
                this.b[1] = (this.a[1] = false);
            }
        }
        final int bb = this.bb;
        if (this.a[4]) {
            this.bb = 48;
            this.ax = this.d[3];
        }
        else {
            this.bb = 22;
            this.ax = this.d[2];
        }
        if (bb < this.bb && this.ag == 0 && this.K < this.d - 1) {
            this.ag = 1;
            ++this.K;
            --this.A;
            if (this.K < this.d - 1) {
                ++this.K;
                --this.A;
                this.A = true;
            }
        }
        else if (bb > this.bb && !b4 && this.ag == 0 && this.K > 0) {
            this.ag = -1;
            --this.K;
            ++this.A;
            if (this.K > 0) {
                --this.K;
                ++this.A;
                this.A = true;
            }
        }
        if (this.a[1]) {
            this.ad = 1;
        }
        else if (this.a[2]) {
            this.ad = 2;
        }
        else if (this.a[5]) {
            this.ad = 5;
        }
        else if (this.a[6]) {
            this.ad = 6;
        }
        else if (this.a[9]) {
            this.ad = 9;
        }
        this.ba = this.b[this.a[this.a[195] + 0 + this.ad]];
        final byte p9 = this.P;
        this.P = (byte)((319 - this.bb - this.ba + this.d[2]) / 16 + 1);
        if (this.P > p9) {
            this.C = true;
        }
        this.A = this.P * 16;
        this.A += 16;
        this.c[2] = (this.c[3] = this.A);
        final int[] c = this.c;
        final int n = 4;
        final int[] c2 = this.c;
        final int n2 = 5;
        final int[] c3 = this.c;
        final int n3 = 7;
        final int[] c4 = this.c;
        final int n4 = 10;
        final int n5 = this.A + this.bb;
        c3[n3] = (c4[n4] = n5);
        c[n] = (c2[n2] = n5);
        this.c[11] = this.c[this.a[this.a[195] + 0 + this.ad]] + this.b[this.a[this.a[195] + 0 + this.ad]];
    }
    
    final void a(final byte b, final byte b2, final byte b3, final byte b4) {
        if (this.c == 0 || this.u > 0) {
            return;
        }
        boolean b5 = false;
        if (b != 100) {
            b5 = true;
            for (int i = 0; i < 10; ++i) {
                if (this.u[i] == 0) {
                    this.u[i] = b;
                    this.k[0][i] = b2;
                    this.k[1][i] = b3;
                    this.k[2][i] = b4;
                    this.g[i] = 0;
                    break;
                }
            }
        }
        else if (this.u[0] != 0) {
            boolean b6 = false;
            b5 = true;
            this.ay = 0;
            for (int j = 0; j < 9; ++j) {
                final int[] g = this.g;
                final int n = j;
                ++g[n];
            }
            if (this.u[1] != 0) {
                if (this.g[0] > 1) {
                    b6 = true;
                }
            }
            else if (this.g[0] > 4) {
                b6 = true;
            }
            if (b6) {
                for (int k = 0; k < 9; ++k) {
                    this.u[k] = this.u[k + 1];
                    this.k[0][k] = this.k[0][k + 1];
                    this.k[1][k] = this.k[1][k + 1];
                    this.k[2][k] = this.k[2][k + 1];
                    this.g[k] = this.g[k + 1];
                    this.u[k + 1] = 0;
                }
                if (this.u[0] != 0) {
                    if (this.u[1] == 0) {
                        this.g[0] = 0;
                    }
                }
            }
        }
        if (b5 && (this.a[1] || this.a[9])) {
            this.a(this.a[0], true, false, this.a[4]);
            this.ay = (byte)((this.k[0][0] != 0 || this.k[1][0] != 0) ? 1 : 0);
        }
    }
    
    private void g(final byte q) {
        try {
            this.q = q;
            this.aM();
            this.aN();
            this.aO();
        }
        catch (final Exception ex) {}
    }
    
    private void aM() {
        this.u = false;
        this.t = false;
        this.F = -1;
        for (short n = 0; n < this.b[121]; ++n) {
            this.e[n] = 0;
        }
        for (int i = 0; i <= 100; ++i) {
            this.e[4040 + i] = -100;
            this.e[4242 + i] = 1;
            this.e[4343 + i] = -1;
        }
        for (int j = 0; j < 50; ++j) {
            final byte[] array = this.a[2];
            final int n2 = j;
            final byte[] array2 = this.a[3];
            final int n3 = j;
            final byte[] array3 = this.a[4];
            final int n4 = j;
            final byte b = 0;
            array3[n4] = b;
            array[n2] = (array2[n3] = b);
        }
        for (int k = 0; k < 10; ++k) {
            this.u[k] = 0;
        }
        for (int l = 0; l < 5; ++l) {
            this.c[0][l][2] = -1;
        }
        for (int n5 = 0; n5 < 30; n5 = (byte)(n5 + 1)) {
            this.e[0][n5] = 0;
        }
        for (int n6 = 0; n6 < 3; n6 = (byte)(n6 + 1)) {
            for (int n7 = 0; n7 < 96; n7 = (byte)(n7 + 1)) {
                this.a[0][n6][n7] = 0;
            }
        }
        for (int n8 = 0; n8 < 10; n8 = (byte)(n8 + 1)) {
            for (int n9 = 0; n9 < 12; n9 = (byte)(n9 + 1)) {
                this.a[0][n8][n9] = 0;
                this.a[1][n8][n9] = 0;
            }
        }
        for (int n10 = 0; n10 < 30; n10 = (byte)(n10 + 1)) {
            for (int n11 = 0; n11 < 4; n11 = (byte)(n11 + 1)) {
                this.f[n11][n10] = 0;
            }
            for (int n12 = 0; n12 < 5; n12 = (byte)(n12 + 1)) {
                this.b[0][n12][n10] = (this.b[1][n12][n10] = 0);
            }
        }
        for (int n13 = 0; n13 < 96; ++n13) {
            for (int n14 = 0; n14 < 96; ++n14) {
                this.c[n13][n14] = (this.b[n13][n14] = 0);
            }
        }
        for (int n15 = 0; n15 < this.P + 3; ++n15) {
            for (byte b2 = 0; b2 < this.O; ++b2) {
                this.g[n15][b2] = 0;
            }
        }
        if (!this.s) {
            for (int n16 = 0; n16 < 26; n16 = (byte)(n16 + 1)) {
                this.a[0][n16] = (this.a[1][n16] = 0);
            }
            this.a[0][17] = 0;
        }
        this.a[0][16] = 1;
        this.t();
        this.c = 0;
        this.h = 0;
        final boolean b3 = false;
        this.N = b3;
        this.L = b3;
        this.F = false;
        this.K = false;
        final int n17 = 0;
        this.X = n17;
        this.W = n17;
        this.aL = 0;
        this.u = 0;
        this.ay = 0;
        this.a.a();
        this.i();
        this.k = true;
    }
    
    private void aN() {
        int n = 0;
        try {
            System.gc();
            Thread.yield();
            int n2 = 0;
            final short n3 = this.a[this.a[149] + this.q * 2];
            this.e = n3;
            this.c = n3;
            final short n4 = this.a[this.a[149] + this.q * 2 + 1];
            this.f = n4;
            this.d = n4;
            if (this.q == 0) {
                this.c = 40;
                this.d = 32;
            }
            else if (this.q == 5) {
                this.c -= 32;
            }
            int n5 = 0;
            byte b = 10;
            for (short n6 = 0; n6 < this.f; ++n6) {
                for (short n7 = 0; n7 < this.e; ++n7) {
                    if (b >= this.a[this.a[197] + 0 + n5]) {
                        n = (short)(this.v[this.h[this.a[this.a[248] + this.q]] + n2] & 0xFF);
                        ++n2;
                        if (n >= 250) {
                            b = 0;
                            n5 = n - 250;
                            n = (this.a[this.a[197] + 6 + n5] & 0xFF);
                        }
                    }
                    ++b;
                    int n8;
                    if ((n8 = n) <= 8) {
                        n8 += this.a(3, 3);
                    }
                    this.b[n6][n7] = (byte)n8;
                    final int n9 = (this.b[9][n8] & 0xFFFF) >> 13 & 0x1;
                    if ((n8 >= 175 || n9 == 1) && this.c[n6][n7] != -127) {
                        this.c[n6][n7] = -126;
                    }
                    else if (this.c[n6][n7] == -126) {
                        this.c[n6][n7] = 0;
                    }
                    if (this.q != 3) {
                        if (((this.j[16][n8] & 0xFFFF) >> 6 & 0x3) == 0x2) {
                            this.c[n6][n7] = -125;
                        }
                        if (n8 >= 180 && n8 <= 231) {
                            this.c[n6][n7] = -124;
                        }
                        else if (n8 >= 175 && n8 <= 179) {
                            this.a(n8 - 175 + 1, n7, n6, this.a[this.a[110] + n8 - 175 + 1]);
                        }
                    }
                    if (n6 == 0 || n6 == this.f - 1 || n7 == this.e - 1) {
                        this.c[n6][n7] = -126;
                    }
                }
            }
            for (short n10 = 0; n10 < this.d; ++n10) {
                for (int i = 1; i < this.c - 1; ++i) {
                    if (c((int)this.c[n10][i]) && this.e[9833 + (this.c[n10][i] + 61) * -1] == 5) {
                        final byte b2;
                        if ((b2 = this.b[n10][i - 1]) == 33 || b2 == 34 || b2 == 37 || b2 == 38) {
                            this.c[n10][i - 1] = -127;
                        }
                        final byte b3;
                        if ((b3 = this.b[n10][i + 1]) == 33 || b3 == 34 || b3 == 37 || b3 == 38) {
                            this.c[n10][i + 1] = -127;
                        }
                    }
                }
            }
        }
        catch (final Exception ex) {}
    }
    
    private void aO() {
        this.aP();
        this.a[0][17] = (short)((this.q != 3) ? 1 : 0);
        this.y = this.C;
        this.A = this.D;
        final byte b = (byte)(this.a[this.a[150] + this.q * 2] - this.y);
        this.J = b;
        this.I = b;
        final byte b2 = (byte)(this.a[this.a[150] + this.q * 2 + 1] - this.A);
        this.L = b2;
        this.K = b2;
        this.aK();
        this.J = this.I;
        this.L = this.K;
        this.z = this.y;
        this.B = this.A;
        this.a.d();
    }
    
    private void aP() {
        if (this.q == 3) {
            this.aw = 0;
        }
        final short n = this.a[250 + this.q];
        for (byte b = this.a[this.a[262] + this.q], b2 = 0; b2 < b; ++b2) {
            if (this.a[n + 0 * b + b2] != -1) {
                if (this.a[n + 1 * b + b2] >= 0) {
                    this.a(this.a[n + 0 * b + b2], this.a[n + 1 * b + b2], this.a[n + 2 * b + b2], this.a[n + 3 * b + b2], this.a[n + 4 * b + b2], true, -1);
                }
                else if (this.a[n + 1 * b + b2] == -1) {
                    this.a((byte)(this.a[n + 0 * b + b2] & 0x1), this.a[n + 2 * b + b2], this.a[n + 3 * b + b2], this.a[n + 4 * b + b2], (byte)((this.a[n + 0 * b + b2] >> 1) + (((this.a[n + 0 * b + b2] & 0x1) != 0x0) ? this.b : 0)));
                }
                else if (this.a[n + 1 * b + b2] == -2) {
                    this.b(1, this.a[n + 2 * b + b2], this.a[n + 3 * b + b2], this.a[n + 0 * b + b2]);
                }
                if (b2 <= 10 && this.q != 1 && this.q != 6) {
                    this.a[0][b2] = this.a[this.a[263] + 11 * this.q * 2 + b2];
                    this.a[1][b2] = (short)(this.a[this.a[263] + 11 * (this.q * 2 + 1) + b2] * 20);
                }
            }
        }
        if (this.q == 0) {
            this.e[7476] = 4;
            this.e[7479] = 5;
            return;
        }
        if (this.q == 3) {
            this.aw = 2;
        }
    }
    
    static boolean a(final Graphics graphics, final Image image, final int n, final int n2, final int n3, final int n4, final int n5, final int n6, final int n7) {
        try {
            graphics.drawRegion(image, n, n2, n3, n4, 0, n5, n6, n7);
            return true;
        }
        catch (final Exception ex) {
            return false;
        }
    }
    
    private static void a(final Graphics graphics, final int n, final int n2, final int n3, final int n4) {
        graphics.fillRect(11 + n, 8 + n2, n3, n4 + 0);
    }
    
    private static void b(final Graphics graphics, final int n, final int n2, final int n3, final int n4) {
        graphics.drawRect(n, n2, n3, n4);
    }
    
    private static void c(final Graphics graphics, final int n, final int n2, final int n3, final int n4) {
        graphics.setClip(n, n2, n3, n4);
    }
    
    private static void d(final Graphics graphics, final int n, final int n2, final int n3, final int n4) {
        graphics.drawLine(n, n2, n3, n4);
    }
    
    private boolean d(final int n) {
        boolean b = false;
        try {
            System.gc();
            Thread.yield();
            final RecordStore openRecordStore;
            if ((openRecordStore = RecordStore.openRecordStore(this.b + n, true)).getNumRecords() <= 0) {
                openRecordStore.closeRecordStore();
                return false;
            }
            final DataInputStream dataInputStream = new DataInputStream(new ByteArrayInputStream(openRecordStore.getRecord(1)));
            try {
                if (n == 0) {
                    this.l = dataInputStream.readInt();
                    this.W = dataInputStream.readBoolean();
                    this.r = dataInputStream.readByte();
                    this.V = (byte)(4 + this.r);
                    this.s = dataInputStream.readByte();
                    this.t = dataInputStream.readByte();
                    this.c = dataInputStream.readByte();
                    this.p = dataInputStream.readByte();
                }
                else {
                    this.q = dataInputStream.readByte();
                    this.aM();
                    this.p = dataInputStream.readByte();
                    this.d = dataInputStream.readByte();
                    if (n == 2) {
                        this.b = this.d;
                    }
                    this.aN();
                    dataInputStream.read(this.e);
                    dataInputStream.read(this.q);
                    dataInputStream.read(this.a[0]);
                    dataInputStream.read(this.a[1]);
                    dataInputStream.read(this.a[2]);
                    dataInputStream.read(this.a[3]);
                    for (int i = 0; i < 26; ++i) {
                        this.a[0][i] = dataInputStream.readShort();
                        this.a[1][i] = dataInputStream.readShort();
                    }
                    dataInputStream.read(this.e[0]);
                    dataInputStream.read(this.e[1]);
                    dataInputStream.read(this.e[2]);
                    for (int j = 0; j < 10; ++j) {
                        for (int k = 0; k < 12; ++k) {
                            this.a[0][j][k] = dataInputStream.readByte();
                            this.a[1][j][k] = dataInputStream.readByte();
                        }
                    }
                    dataInputStream.read(this.f[0]);
                    dataInputStream.read(this.f[1]);
                    dataInputStream.read(this.f[2]);
                    dataInputStream.read(this.f[3]);
                    for (int l = 0; l < 5; ++l) {
                        dataInputStream.read(this.b[0][l]);
                        dataInputStream.read(this.b[1][l]);
                        dataInputStream.read(this.c[0][l]);
                        dataInputStream.read(this.c[1][l]);
                    }
                    this.aq = dataInputStream.readByte();
                    final byte byte1 = dataInputStream.readByte();
                    this.z = byte1;
                    this.y = byte1;
                    final byte byte2 = dataInputStream.readByte();
                    this.B = byte2;
                    this.A = byte2;
                    final byte byte3 = dataInputStream.readByte();
                    this.J = byte3;
                    this.I = byte3;
                    final byte byte4 = dataInputStream.readByte();
                    this.L = byte4;
                    this.K = byte4;
                    this.h = dataInputStream.readByte();
                    this.ai = dataInputStream.readByte();
                    this.c = dataInputStream.readInt();
                    this.L = dataInputStream.readBoolean();
                    this.N = dataInputStream.readBoolean();
                    for (int n2 = 0; n2 < 3; ++n2) {
                        for (int n3 = 0; n3 < 96; ++n3) {
                            this.a[0][n2][n3] = dataInputStream.readInt();
                        }
                    }
                    dataInputStream.read(this.a.c[0]);
                    dataInputStream.read(this.a.c[1]);
                    dataInputStream.read(this.a.c[2]);
                    dataInputStream.read(this.a.c[3]);
                    dataInputStream.read(this.a.c[4]);
                    dataInputStream.read(this.a.c[5]);
                    this.a.f = dataInputStream.readByte();
                    this.a.K = dataInputStream.readByte();
                    this.a.R = dataInputStream.readByte();
                    this.a.L = dataInputStream.readByte();
                    this.a.aQ = dataInputStream.readInt();
                    dataInputStream.read(this.a.f[0]);
                    dataInputStream.read(this.a.f[1]);
                    dataInputStream.read(this.a.g[0]);
                    dataInputStream.read(this.a.g[1]);
                    dataInputStream.read(this.a.g[2]);
                    dataInputStream.read(this.a.j);
                    this.a.N = dataInputStream.readByte();
                    this.a.O = dataInputStream.readByte();
                    this.a.g = dataInputStream.readByte();
                    this.a.J = dataInputStream.readByte();
                    this.a.I = dataInputStream.readByte();
                    dataInputStream.read(this.t);
                    int n4 = -111;
                    while (n4 >= -122) {
                        final byte byte5;
                        if ((byte5 = dataInputStream.readByte()) == 127) {
                            --n4;
                        }
                        else {
                            this.c[dataInputStream.readByte()][byte5] = (byte)n4;
                        }
                    }
                    for (int n5 = 0; n5 < 30; ++n5) {
                        if (this.f[0][n5] != 0) {
                            this.c[this.f[3][n5]][this.f[2][n5]] = (byte)((this.f[0][n5] <= 30) ? -123 : -126);
                        }
                    }
                    for (int n6 = 0; n6 < 50; ++n6) {
                        if (this.e[9833 + n6] >= 6) {
                            this.c[this.e[9783 + n6]][this.e[9733 + n6]] = (byte)(-61 - n6);
                        }
                    }
                    for (int n7 = 1; n7 <= 100; ++n7) {
                        if (this.e[1919 + n7] != 0) {
                            this.e[808 + n7] = 0;
                            if (this.e[4646 + n7] < 0) {
                                this.c[this.e[101 + n7]][this.e[0 + n7]] = (byte)n7;
                                if ((this.e[2929 + n7] & 0xFF) <= 7 && (this.e[1111 + n7] & 0xF) < (this.a[this.a[15] + (this.e[606 + n7] & 0x1) * 9 + this.e[1010 + n7] - this.e[7777 + n7]] + 1) / 2 && this.c[this.e[101 + n7] + this.a[this.a[1] + 8 + this.e[606 + n7]]][this.e[0 + n7] + this.a[this.a[1] + this.e[606 + n7]]] == 0) {
                                    this.c[this.e[101 + n7] + this.a[this.a[1] + 8 + this.e[606 + n7]]][this.e[0 + n7] + this.a[this.a[1] + this.e[606 + n7]]] = -128;
                                }
                            }
                        }
                    }
                    for (int n8 = 0; n8 < 22; ++n8) {
                        this.e[9689 + n8] = 0;
                        if (this.e[9513 + n8] != 0) {
                            this.c[this.e[9381 + n8]][this.e[9359 + n8]] = (byte)(101 + n8);
                            if ((this.e[9557 + n8] & 0xFF) <= 7 && (this.e[9623 + n8] & 0xF) < (this.a[this.a[15] + (this.e[9491 + n8] & 0x1) * 9 + this.a[this.a[179] + this.e[9535 + n8]]] + 1) / 2 && this.c[this.e[9381 + n8] + this.a[this.a[1] + 8 + this.e[9491 + n8]]][this.e[9359 + n8] + this.a[this.a[1] + this.e[9491 + n8]]] == 0) {
                                this.c[this.e[9381 + n8] + this.a[this.a[1] + 8 + this.e[9491 + n8]]][this.e[9359 + n8] + this.a[this.a[1] + this.e[9491 + n8]]] = -128;
                            }
                        }
                    }
                    for (int n9 = 1; n9 <= 60; ++n9) {
                        if (this.e[8505 + n9] != 0) {
                            for (byte b2 = 0; b2 < this.a[this.a[138] + 130 + this.e[8749 + n9]]; ++b2) {
                                for (byte b3 = 0; b3 < this.a[this.a[138] + 104 + this.e[8749 + n9]]; ++b3) {
                                    this.c[this.e[8444 + n9] + b2][this.e[8383 + n9] + b3] = (byte)(-n9);
                                }
                            }
                        }
                    }
                    this.a.n();
                    this.a.j();
                    this.a.d();
                    this.aK();
                    this.J = this.I;
                    this.L = this.K;
                }
                b = true;
            }
            catch (final Exception ex) {}
            dataInputStream.close();
            openRecordStore.closeRecordStore();
            if (!b) {
                RecordStore.deleteRecordStore(this.b + n);
                this.d(n);
            }
            return b;
        }
        catch (final Exception ex2) {
            return false;
        }
    }
    
    private boolean e(final int n) {
        boolean b = false;
        try {
            RecordStore openRecordStore = null;
            ByteArrayOutputStream out = null;
            DataOutputStream dataOutputStream = null;
            try {
                RecordStore.deleteRecordStore(this.b + n);
                openRecordStore = RecordStore.openRecordStore(this.b + n, true);
                out = new ByteArrayOutputStream();
                dataOutputStream = new DataOutputStream(out);
                if (n == 0) {
                    dataOutputStream.writeInt(this.l);
                    dataOutputStream.writeBoolean(this.W);
                    dataOutputStream.writeByte(this.r);
                    dataOutputStream.writeByte(this.s);
                    dataOutputStream.writeByte(this.t);
                    dataOutputStream.writeByte(this.c);
                    dataOutputStream.writeByte(this.p);
                }
                else {
                    if (n == 2) {
                        this.W = true;
                    }
                    else if (n == 1) {
                        this.t = this.a[this.a[248] + this.q];
                    }
                    dataOutputStream.writeByte(this.q);
                    dataOutputStream.writeByte(this.p);
                    dataOutputStream.writeByte(this.d);
                    dataOutputStream.write(this.e);
                    dataOutputStream.write(this.q);
                    dataOutputStream.write(this.a[0]);
                    dataOutputStream.write(this.a[1]);
                    dataOutputStream.write(this.a[2]);
                    dataOutputStream.write(this.a[3]);
                    for (int i = 0; i < 26; ++i) {
                        dataOutputStream.writeShort(this.a[0][i]);
                        dataOutputStream.writeShort(this.a[1][i]);
                    }
                    dataOutputStream.write(this.e[0]);
                    dataOutputStream.write(this.e[1]);
                    dataOutputStream.write(this.e[2]);
                    for (int j = 0; j < 10; ++j) {
                        for (int k = 0; k < 12; ++k) {
                            dataOutputStream.writeByte(this.a[0][j][k]);
                            dataOutputStream.writeByte(this.a[1][j][k]);
                        }
                    }
                    dataOutputStream.write(this.f[0]);
                    dataOutputStream.write(this.f[1]);
                    dataOutputStream.write(this.f[2]);
                    dataOutputStream.write(this.f[3]);
                    for (int l = 0; l < 5; ++l) {
                        dataOutputStream.write(this.b[0][l]);
                        dataOutputStream.write(this.b[1][l]);
                        dataOutputStream.write(this.c[0][l]);
                        dataOutputStream.write(this.c[1][l]);
                    }
                    dataOutputStream.writeByte(this.aq);
                    dataOutputStream.writeByte(this.y);
                    dataOutputStream.writeByte(this.A);
                    dataOutputStream.writeByte(this.I);
                    dataOutputStream.writeByte(this.K);
                    dataOutputStream.writeByte(this.h);
                    dataOutputStream.writeByte(this.ai);
                    dataOutputStream.writeInt(this.c);
                    dataOutputStream.writeBoolean(this.L);
                    dataOutputStream.writeBoolean(this.N);
                    for (int n2 = 0; n2 < 3; ++n2) {
                        for (int n3 = 0; n3 < 96; ++n3) {
                            dataOutputStream.writeInt(this.a[0][n2][n3]);
                        }
                    }
                    dataOutputStream.write(this.a.c[0]);
                    dataOutputStream.write(this.a.c[1]);
                    dataOutputStream.write(this.a.c[2]);
                    dataOutputStream.write(this.a.c[3]);
                    dataOutputStream.write(this.a.c[4]);
                    dataOutputStream.write(this.a.c[5]);
                    dataOutputStream.writeByte(this.a.f);
                    dataOutputStream.writeByte(this.a.K);
                    dataOutputStream.writeByte(this.a.R);
                    dataOutputStream.writeByte(this.a.L);
                    dataOutputStream.writeInt(this.a.aQ);
                    dataOutputStream.write(this.a.f[0]);
                    dataOutputStream.write(this.a.f[1]);
                    dataOutputStream.write(this.a.g[0]);
                    dataOutputStream.write(this.a.g[1]);
                    dataOutputStream.write(this.a.g[2]);
                    dataOutputStream.write(this.a.j);
                    dataOutputStream.writeByte(this.a.N);
                    dataOutputStream.writeByte(this.a.O);
                    dataOutputStream.writeByte(this.a.g);
                    dataOutputStream.writeByte(this.a.J);
                    dataOutputStream.writeByte(this.a.I);
                    dataOutputStream.write(this.t);
                    for (byte b2 = -111; b2 >= -122; --b2) {
                        for (short v = 0; v < this.c; ++v) {
                            for (short v2 = 0; v2 < this.d; ++v2) {
                                if (this.c[v2][v] == b2) {
                                    dataOutputStream.writeByte(v);
                                    dataOutputStream.writeByte(v2);
                                }
                            }
                        }
                        dataOutputStream.writeByte(127);
                    }
                }
                openRecordStore.addRecord(out.toByteArray(), 0, out.size());
                b = true;
            }
            catch (final Exception ex) {}
            if (openRecordStore != null) {
                openRecordStore.closeRecordStore();
            }
            if (out != null) {
                out.close();
            }
            if (dataOutputStream != null) {
                dataOutputStream.close();
            }
        }
        catch (final Exception ex2) {}
        return b;
    }
    
    final int a(final int n, final int n2) {
        return (this.a.nextInt() & n) % n2;
    }
    
    private static long a() {
        return System.currentTimeMillis();
    }
    
    public final void hideNotify() {
        this.d();
    }
    
    public final void showNotify() {
        this.e();
    }
    
    public final void d() {
        this.Y = true;
        this.Z = true;
        if (this.aa && !this.ad) {
            this.aR();
        }
        this.ad = true;
    }
    
    public final void e() {
        this.Y = false;
    }
    
    private void aQ() {
        this.a.k();
        f.f = this.b[this.h * 2 + this.a(255, 2)];
        if (this.a == null || this.a.a() <= 100 || f.f != f.g) {
            f.g = f.f;
            this.aR();
            new StringBuffer().append("/s").append(f.f).toString();
            this.a = new a("audio/midi");
        }
        this.a.a(this.e);
    }
    
    private void aR() {
        if (this.a != null) {
            this.a.a();
            this.a.b();
            this.a = null;
        }
    }
    
    private void aS() {
        if (this.Z) {
            if (this.Q != 27 && this.ac) {
                this.ab = true;
                this.v = 0;
                this.S = this.R;
                this.R = this.Q;
                this.Q = 27;
                this.z = this.y;
                this.B = this.A;
                this.J = this.I;
                this.L = this.K;
            }
            while (this.Y) {
                this.n = false;
                Thread.yield();
                tribes.a(10);
            }
        }
        this.Z = false;
        this.ad = false;
        if (this.Q != 27 && this.e == 2 && (this.a == null || (this.a != null && this.a.a() != 400))) {
            this.aQ();
        }
        tribes.a(10);
    }
    
    private void m(final int n) {
        if (n == this.j[0]) {
            for (int i = 0; i < 6; ++i) {
                this.i[i] = 0;
            }
            this.i[0] = this.j[0];
            return;
        }
        if (this.i[0] == this.j[0]) {
            for (int j = 0; j < 6; ++j) {
                if (this.i[j] == 0) {
                    this.i[j] = n;
                    break;
                }
            }
            this.ae = true;
            for (int k = 0; k < 5; ++k) {
                if (this.i[k] != this.j[k]) {
                    this.ae = false;
                    break;
                }
            }
            if (this.ae && this.i[5] != 0) {
                switch (this.i[5]) {
                    case 49: {
                        this.af = true;
                        break;
                    }
                    case 51: {
                        this.ag = true;
                        break;
                    }
                    case 55: {
                        final short[] array = this.a[0];
                        final int n2 = 0;
                        array[n2] += 100;
                        final short[] array2 = this.a[0];
                        final int n3 = 1;
                        array2[n3] += 100;
                        final short[] array3 = this.a[0];
                        final int n4 = 2;
                        array3[n4] += 100;
                        final short[] array4 = this.a[0];
                        final int n5 = 3;
                        array4[n5] += 100;
                        final short[] array5 = this.a[0];
                        final int n6 = 4;
                        array5[n6] += 100;
                        final short[] array6 = this.a[0];
                        final int n7 = 5;
                        array6[n7] += 3;
                        final short[] array7 = this.a[0];
                        final int n8 = 8;
                        array7[n8] += 3;
                        final short[] array8 = this.a[0];
                        final int n9 = 10;
                        array8[n9] += 3;
                        break;
                    }
                    case 57: {
                        this.u = 1;
                        if (this.q == 0) {
                            ++this.q;
                            break;
                        }
                        break;
                    }
                }
                this.i[0] = 0;
            }
        }
    }
    
    static {
        f.a = -6;
        f.b = -7;
        a = new Image[4];
        a = new Graphics[4];
        f.M = 0;
        f.ag = 40;
        f.ah = 60;
    }
}
