/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Display
 *  javax.microedition.lcdui.Displayable
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 *  javax.microedition.midlet.MIDlet
 */
import com.nokia.mid.ui.FullCanvas;
import java.util.Random;
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Displayable;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;
import javax.microedition.midlet.MIDlet;

public final class e
extends FullCanvas
implements Runnable {
    private int[][] ad;
    private byte ae = 0;
    private short[][] af;
    private int ag = 50;
    private byte ah;
    private byte ai;
    private byte aj;
    private byte ak;
    private byte al;
    private byte am;
    boolean a;
    int b;
    int c;
    private int an = 35;
    private int ao = 103;
    private byte[][] ap;
    boolean d = true;
    private short[] aq;
    private int ar;
    private int as = 0;
    private short at = 0;
    private int au;
    int e;
    private int av;
    int f;
    private int aw;
    private int ax;
    private int ay = 1;
    private byte[][] az;
    private int aA = 0xFFFFFF;
    private Image aB;
    int[] g;
    private Image[] aC;
    private int aD = 0;
    private int aE;
    private int aF;
    private int[] aG;
    private short[][] aH;
    private boolean aI = false;
    private byte[][] aJ;
    byte[][] h;
    String i;
    private boolean aK = false;
    boolean j = true;
    private boolean aL = false;
    private byte[] aM;
    private byte aN = 0;
    private short[][] aO;
    Image k;
    byte l;
    byte m;
    private int[] aP;
    private byte[] aQ;
    static byte n;
    static byte o;
    Image p;
    Image q;
    Image r;
    private static int[] aR;
    private byte[] aS;
    private byte[] aT;
    private int[][] aU;
    private byte aV = 0;
    private int[][] aW;
    private int aX = 0;
    private int aY = 128;
    private int aZ = 0;
    a s;
    private int ba = 2;
    private byte bb = 1;
    private byte bc;
    private boolean bd = true;
    int t;
    private byte be = 0;
    private byte bf;
    private byte bg;
    private byte bh;
    private boolean bi = true;
    private int bj = 0;
    private boolean bk = false;
    private boolean bl = false;
    private int bm = 0;
    private int bn;
    private boolean bo = true;
    private boolean bp = false;
    private int bq = 1;
    private int br = 2;
    private int bs = 9;
    private int bt;
    private byte bu;
    private byte bv;
    private byte bw;
    private byte bx;
    private byte by;
    static int u;
    static byte v;
    Image w;
    static int x;
    byte y;
    boolean z = false;
    boolean A = false;
    Image B;
    int C = 0;
    private Image bz;
    private byte[] bA;
    private byte bB;
    private int bC;
    int D = 20;
    private byte bD;
    private int bE;
    private int bF;
    int E = 10;
    private int bG = 0;
    int F = 15;
    private int bH;
    private int bI;
    private byte bJ;
    private byte bK;
    private int bL;
    private int bM;
    private byte bN;
    private byte bO;
    private byte bP;
    int G = 20;
    private int bQ;
    private int bR;
    private int bS = 4;
    int H = 5;
    private short bT;
    byte I;
    private int bU = 0;
    private byte bV = 0;
    private c bW;
    static boolean J;
    byte K = 0;
    private short[][] bX;
    private Random bY = new Random();
    boolean L;
    static String M;
    private boolean bZ = false;
    private Image[] ca;
    private Image[] cb;
    private Image[] cc;
    private int[][] cd;
    byte N;
    private long ce;
    byte[] O;
    static int P;
    private int cf = 0;
    private int cg = 0;
    boolean Q = false;
    private byte[] ch;
    boolean R = false;
    private short[] ci;
    private short[] cj;
    private short[] ck;
    boolean S = true;
    int T = 0;
    private String cl;
    private byte[] cm;
    private byte cn = 0;
    private int[] co;
    private long cp;
    private byte[] cq;
    private int[][] cr;
    private byte cs;
    private int ct = 0;
    private byte[] cu;
    private long cv = 0L;
    private byte[][] cw;
    private short[][] cx;
    byte[] U;
    static boolean V;
    private byte[] cy;
    private int cz = 60;
    private int cA = 40;
    private int cB;
    private int[][] cC;
    private int cD = 0;
    int W = 77;
    byte X = 0;
    private String[] cE;
    private int[] cF;
    byte Y = 0;
    private long cG;
    private long cH;
    String[] Z;
    private Thread cI;
    private byte[] cJ;
    private byte cK;
    short aa = 0;
    private short[] cL;
    private byte cM = 0;
    int[][] ab;
    static boolean ac;
    private byte cN;
    private byte[][] cO;
    private byte[][] cP;
    private byte[] cQ;
    private byte[][] cR;
    private int cS;
    private int cT;
    private short[] cU;

    static {
        x = 32;
        M = "ertem";
        n = (byte)2;
        o = (byte)2;
        v = 0;
        P = 0;
        J = true;
        ac = true;
        V = true;
        u = 9;
    }

    public e() {
        this.e = this.getWidth();
        this.b = this.getHeight();
        this.f = this.e >> 1;
        this.c = this.b >> 1;
        this.co = new int[]{0, 0, 0, 0, 0, 0};
        this.cE = new String[]{""};
        this.bD = (byte)6;
        this.cm = new byte[]{0, 0};
        this.bc = (byte)2;
        this.I = (byte)10;
        this.g = new int[]{0, 0};
        this.bN = (byte)6;
        this.aW = new int[][]{{1142, 240}, {32, 240}};
        this.aU = new int[][]{{950, 200, -1}, {160, 240, -1}};
        this.aq = new short[]{0, 0, 0, 0, 0, 0};
        this.aQ = new byte[]{0, 0, 0, 0, 0, 0};
        this.cK = (byte)20;
        this.cy = new byte[]{1, 3, 7, 10, 5, 10};
        this.ap = new byte[][]{{54, 49}, {48, 46, 47}, {42, 41, 39}, {42, 41, 40}, {38, 37, 36}, {35, 34, 33}, {45, 43, 44}, {111, 110, 109, 108, 107, 107}, {112, 113, 114, 114}, {115, 116, 117, 117}};
        this.cC = new int[50][7];
        this.bA = new byte[]{0, 0, 0, 0};
        this.aM = new byte[]{0, 0, 0, 0, 0, 0};
        this.cJ = new byte[]{0, 0, 0, 0, 0, 0};
        this.ad = new int[][]{{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}};
        this.af = new short[][]{{1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}};
        this.az = new byte[][]{{-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}};
        this.cU = new short[12];
        this.aS = new byte[]{0, 0, 0, 0, 0, 0};
        this.aT = new byte[]{43, 46, 0, 0, 0, 0};
        this.cu = new byte[]{0, 0, 0, 1, 1, 1};
        this.ab = new int[][]{{300, 240, 0, 0, 0, 100, 100, 1, 1, 13, 22, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0}, {1100, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 4, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0}, {1120, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0}, {230, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0}, {49, 40, 0, 0, 1, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0}, {60, 40, 0, 0, 1, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0}};
        this.bJ = (byte)5;
        this.bK = (byte)5;
        this.bu = (byte)11;
        this.bv = (byte)7;
        this.bx = (byte)7;
        this.bw = (byte)24;
        this.by = (byte)25;
        this.cB = this.e / this.cA + 1;
        this.aG = new int[4];
        this.cF = new int[4];
        this.cQ = new byte[]{0, 61, 62, 63, 64, 0};
        this.ak = (byte)5;
        this.ai = (byte)10;
        this.ah = (byte)30;
        this.al = (byte)35;
        this.am = (byte)100;
        this.aj = (byte)-25;
        this.cL = new short[]{0, 0, 80, 130, 200, 300};
        this.bB = (byte)10;
        this.y = (byte)11;
        this.N = (byte)4;
        this.cI = new Thread(this);
    }

    private final void a(int n, int n2, byte by) {
        if (this.cD == 15) {
            return;
        }
        int n3 = 0;
        ++this.cD;
        while (true) {
            if (this.cC[n3][3] < 1) {
                this.cC[n3][0] = n;
                this.cC[n3][1] = n2;
                this.cC[n3][3] = this.ap[by].length + 1;
                this.cC[n3][2] = by;
                this.cC[n3][6] = this.bj;
                return;
            }
            ++n3;
        }
    }

    private final void g() {
        if (this.ab[this.bj][11] == 0 && this.az[this.bj][1] != 1) {
            this.az[this.bj][0] = 1;
            this.az[this.bj][1] = 1;
            this.ab[this.bj][17] = -1;
            this.ab[this.bj][16] = 4;
        }
    }

    private void h() {
        this.ab[this.bj][4] = 0;
        if (this.aM[this.bj] == 0) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] - (this.bc << 1);
        }
        if (this.aM[this.bj] == -1) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] - this.bc;
        }
        if (this.aM[this.bj] == 1) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] - (this.bc << 2);
        }
        if (this.ab[this.bj][2] < -this.ab[this.bj][18]) {
            this.ab[this.bj][2] = -this.ab[this.bj][18];
        }
        if (this.ab[this.bj][11] == 0) {
            this.az[this.bj][0] = 0;
        }
    }

    /*
     * Unable to fully structure code
     */
    private final void i() {
        this.ae = (byte)(this.ae + 1);
        if (this.ae >= this.I) {
            this.ae = 0;
        }
        this.bj = 0;
        while (this.bj < this.I) {
            block277: {
                block281: {
                    block279: {
                        block280: {
                            v0 = this.bj;
                            this.cJ[v0] = this.cJ[v0];
                            if (this.cJ[this.bj] > 1) {
                                this.cJ[this.bj] = 0;
                            }
                            if (this.ab[this.bj][12] == 0) {
                                if (this.aQ[this.bj] < 2) {
                                    this.h(this.bj);
                                }
                                if (this.t != 4) {
                                    v1 = this.bj;
                                    this.aQ[v1] = (byte)(this.aQ[v1] - 1);
                                }
                            }
                            var1_1 = this;
                            var2_4 = var1_1;
                            if (var1_1.ab[var2_4.bj][11] != 1) break block279;
                            if (var2_4.ab[var2_4.bj][3] < var2_4.bR) {
                                if (var2_4.aM[var2_4.bj] == 0) {
                                    v2 = var2_4.ab[var2_4.bj];
                                    v2[3] = v2[3] + var2_4.ba;
                                }
                                if (var2_4.aM[var2_4.bj] == -1) {
                                    v3 = var2_4.ab[var2_4.bj];
                                    v3[3] = v3[3] + (var2_4.ba >> 1);
                                }
                                if (var2_4.aM[var2_4.bj] == 1) {
                                    v4 = var2_4.ab[var2_4.bj];
                                    v4[3] = v4[3] + (var2_4.ba << 1);
                                }
                            } else {
                                var2_4.ab[var2_4.bj][3] = var2_4.bR;
                            }
                            v5 = var2_4.ab[var2_4.bj];
                            v5[1] = v5[1] + var2_4.ab[var2_4.bj][3];
                            var2_4.j();
                            if (var2_4.ab[var2_4.bj][3] <= 0) break block280;
                            if (var2_4.ab[var2_4.bj][12] == 1) {
                                var2_4.az[var2_4.bj][0] = 2;
                            }
                            if (var2_4.aJ[6][var2_4.cR[var2_4.cS][var2_4.cT]] == 0) break block280;
                            if (var2_4.ab[var2_4.bj][12] == 1) {
                                var2_4.az[var2_4.bj][0] = 3;
                            }
                            var2_4.ab[var2_4.bj][1] = (var2_4.cT << 4) + var2_4.aJ[6][var2_4.cR[var2_4.cS][var2_4.cT]];
                            var2_4.ab[var2_4.bj][11] = 0;
                            var2_4.ab[var2_4.bj][3] = 0;
                            var2_4.n();
                            ** GOTO lbl59
                        }
                        v6 = true;
                        break block281;
                    }
                    var2_4.j();
                    if (var2_4.aJ[6][var2_4.cR[var2_4.cS][var2_4.cT]] == 0) {
                        var2_4.af[var2_4.bj][1] = 0;
                        var2_4.ab[var2_4.bj][11] = 1;
                        var2_4.ab[var2_4.bj][3] = 0;
                        v6 = true;
                    } else {
                        if (var2_4.aJ[9][var2_4.cR[var2_4.cS][var2_4.cT]] == 0) {
                            var2_4.ab[var2_4.bj][1] = (var2_4.cT << 4) + var2_4.aJ[6][var2_4.cR[var2_4.cS][var2_4.cT]];
                        }
lbl59:
                        // 4 sources

                        v6 = false;
                    }
                }
                var2_4 = var1_1;
                v7 = var2_4.ab[var2_4.bj];
                v7[0] = v7[0] + var2_4.ab[var2_4.bj][2];
                if (var2_4.ab[var2_4.bj][2] != 0) {
                    if (var2_4.ab[var2_4.bj][2] > 0) {
                        var3_7 = var2_4;
                        if (!var3_7.n() && var3_7.ab[var3_7.bj][0] - var3_7.aw + (var3_7.ab[var3_7.bj][9] >> 1) >= 16) {
                            ++var3_7.cS;
                            if (var3_7.cT != 0) {
                                --var3_7.cT;
                            }
                            if (var3_7.cT > 0 && var3_7.aJ[6][var3_7.cR[var3_7.cS][var3_7.cT]] == 2) {
                                var3_7.ab[var3_7.bj][0] = var3_7.aw + 16 - (var3_7.ab[var3_7.bj][9] >> 1);
                            }
                        }
                        v8 = var2_4.ab[var2_4.bj];
                        v8[2] = v8[2] - var2_4.bc;
                        if (var2_4.ab[var2_4.bj][2] < 0) {
                            var2_4.ab[var2_4.bj][2] = 0;
                        }
                    } else {
                        var3_8 = var2_4;
                        if (!var3_8.n() && var3_8.ab[var3_8.bj][0] - var3_8.aw - (var3_8.ab[var3_8.bj][9] >> 1) <= 0) {
                            --var3_8.cS;
                            --var3_8.cT;
                            if (var3_8.cT > 0 && var3_8.aJ[6][var3_8.cR[var3_8.cS][var3_8.cT]] == 2) {
                                var3_8.ab[var3_8.bj][0] = var3_8.aw + (var3_8.ab[var3_8.bj][9] >> 1);
                            }
                        }
                        v9 = var2_4.ab[var2_4.bj];
                        v9[2] = v9[2] + var2_4.bc;
                        if (var2_4.ab[var2_4.bj][2] > 0) {
                            var2_4.ab[var2_4.bj][2] = 0;
                        }
                    }
                }
                var1_1.j();
                var1_1 = this;
                if (var1_1.ab[var1_1.bj][12] == 1 && var1_1.bj != var1_1.Y) {
                    if (var1_1.af[var1_1.bj][3] > -1) {
                        v10 = var1_1.af[var1_1.bj];
                        v10[3] = (short)(v10[3] - 1);
                        if (var1_1.af[var1_1.bj][3] == -1) {
                            var4_12 = var1_1;
                            var4_12.af[var4_12.bj][3] = 20;
                            var4_12.ab[var4_12.bj][27] = var4_12.c(100);
                            if (var4_12.af[var4_12.bj][0] == 0) {
                                if (var4_12.ab[var4_12.bj][27] == 50) {
                                    var4_12.af[var4_12.bj][0] = 2;
                                }
                                if (var4_12.ab[var4_12.bj][27] > 95) {
                                    var4_12.af[var4_12.bj][0] = 6;
                                    var4_12.af[var4_12.bj][3] = (byte)(var4_12.c(150) + 20);
                                }
                                var5_14 = 0;
                                while (var5_14 < var4_12.I) {
                                    if (var4_12.cu[var5_14] != var4_12.cu[var4_12.bj]) {
                                        if (e.g(var4_12.ab[var5_14][0] - var4_12.ab[var4_12.bj][0]) < var4_12.e) {
                                            var4_12.ab[var4_12.bj][13] = var5_14;
                                            var4_12.af[var4_12.bj][0] = 1;
                                            break;
                                        }
                                        var4_12.ab[var4_12.bj][13] = var5_14;
                                    }
                                    ++var5_14;
                                }
                            } else if (var4_12.af[var4_12.bj][0] == 1) {
                                if (var4_12.ab[var4_12.ab[var4_12.bj][13]][12] == 0) {
                                    var4_12.af[var4_12.bj][0] = 0;
                                } else if (var4_12.ab[var4_12.bj][5] <= var4_12.ab[var4_12.bj][23] - (var4_12.ab[var4_12.bj][23] >> 1) || var4_12.ab[var4_12.bj][27] > 80) {
                                    var4_12.ab[var4_12.bj][27] = var4_12.c(3);
                                    var4_12.af[var4_12.bj][0] = 2;
                                    var4_12.af[var4_12.bj][3] = 300;
                                }
                            } else if (var4_12.af[var4_12.bj][0] == 2) {
                                var4_12.af[var4_12.bj][0] = 4;
                                var4_12.af[var4_12.bj][3] = 150;
                            } else if (var4_12.af[var4_12.bj][0] == 4) {
                                var4_12.af[var4_12.bj][0] = 1;
                                var4_12.af[var4_12.bj][3] = 300;
                            } else if (var4_12.af[var4_12.bj][0] == 5) {
                                if (e.g(var4_12.aW[var4_12.cu[var4_12.bj]][0] - var4_12.ab[var4_12.bj][0]) < var4_12.e) {
                                    var4_12.af[var4_12.bj][0] = 3;
                                }
                            } else if (var4_12.af[var4_12.bj][0] == 6) {
                                var4_12.af[var4_12.bj][0] = 1;
                                var4_12.af[var4_12.bj][3] = 300;
                            }
                        }
                    }
                    if (var1_1.ae == var1_1.bj) {
                        switch (var1_1.af[var1_1.bj][0]) {
                            case -1: {
                                break;
                            }
                            case 0: {
                                if (32 > var1_1.ab[var1_1.bj][0]) {
                                    var1_1.ab[var1_1.bj][4] = 1;
                                }
                                if (var1_1.bL + var1_1.e - 32 < var1_1.ab[var1_1.bj][0]) {
                                    var1_1.ab[var1_1.bj][4] = 0;
                                }
                                var1_1.ad[var1_1.bj][0] = var1_1.ab[var1_1.bj][4] * (var1_1.bL + var1_1.e);
                                var1_1.af[var1_1.bj][1] = 1;
                                break;
                            }
                            case 1: {
                                var1_1.cF[0] = var1_1.ab[var1_1.ab[var1_1.bj][13]][0];
                                var1_1.cF[1] = var1_1.ab[var1_1.ab[var1_1.bj][13]][1];
                                var1_1.cF[2] = var1_1.ab[var1_1.ab[var1_1.bj][13]][9];
                                var1_1.cF[3] = var1_1.ab[var1_1.ab[var1_1.bj][13]][10];
                                super.a(var1_1.cF);
                                break;
                            }
                            case 2: {
                                if (var1_1.t == 3 || var1_1.t == 1) {
                                    if (var1_1.cu[var1_1.bj] == 0) {
                                        var1_1.cF[0] = var1_1.cj[var1_1.ab[var1_1.bj][14] << 1] << 4;
                                        var1_1.cF[1] = var1_1.cj[(var1_1.ab[var1_1.bj][14] << 1) + 1] << 4;
                                    } else {
                                        var1_1.cF[0] = var1_1.ci[var1_1.ab[var1_1.bj][14] << 1] << 4;
                                        var1_1.cF[1] = var1_1.ci[(var1_1.ab[var1_1.bj][14] << 1) + 1] << 4;
                                    }
                                } else {
                                    var1_1.cF[0] = var1_1.ck[var1_1.ab[var1_1.bj][14] << 1] << 4;
                                    var1_1.cF[1] = var1_1.ck[(var1_1.ab[var1_1.bj][14] << 1) + 1] << 4;
                                }
                                var1_1.cF[2] = 16;
                                var1_1.cF[3] = 32;
                                var1_1.a(var1_1.cF);
                                break;
                            }
                            case 3: {
                                var2_5 = var1_1.aW[1][0];
                                var3_9 = 0;
                                if (var1_1.cu[var1_1.bj] == 0) {
                                    var2_5 = var1_1.aW[0][0];
                                }
                                var3_9 = var1_1.aW[0][1];
                                var1_1.cF[0] = var2_5;
                                var1_1.cF[2] = 16;
                                var1_1.cF[1] = var3_9 - 16;
                                var1_1.cF[3] = 16;
                                var1_1.a(var1_1.cF);
                                break;
                            }
                            case 4: {
                                var1_1.cF[0] = var1_1.cd[0][2];
                                var1_1.cF[2] = 16;
                                var1_1.cF[1] = var1_1.cd[0][3];
                                var1_1.cF[3] = 16;
                                var1_1.a(var1_1.cF);
                                break;
                            }
                            case 5: {
                                var1_1.ab[var1_1.bj][4] = var1_1.cu[var1_1.bj] == 0 ? 0 : 1;
                                var1_1.ad[var1_1.bj][0] = var1_1.ab[var1_1.bj][4] * (var1_1.bL + var1_1.e);
                                var1_1.af[var1_1.bj][1] = 1;
                            }
                        }
                    }
                    var5_14 = var1_1.cO[var1_1.cS][var1_1.cT];
                    var4_12 = var1_1;
                    var6_15 = 0;
                    var8_20 = 0;
                    var2_6 = var4_12.e - var4_12.av;
                    if (var4_12.ab[var4_12.bj][8] == 0) {
                        var2_6 = 16;
                    }
                    var1_1 = var4_12;
                    var3_10 = 6;
                    while (var3_10 != 0) {
                        if (var1_1.cx[var1_1.bj][var3_10 = (int)((byte)(var3_10 - 1))] <= 0 || var1_1.cw[var1_1.bj][var3_10] <= 0) continue;
                        var1_1.ab[var1_1.bj][8] = var3_10;
                        break;
                    }
                    var8_20 = 0;
                    while (var8_20 < var4_12.I) {
                        if (var4_12.af[var4_12.bj][0] == 2) break;
                        if (var4_12.cu[var8_20] != var4_12.cu[var4_12.bj] && var4_12.ab[var8_20][12] != 0) {
                            var7_19 = var4_12.ab[var4_12.bj][0] - var4_12.ab[var8_20][0];
                            var6_15 = 0;
                            if (var7_19 < 0) {
                                var7_19 = -var7_19;
                                var6_15 = 1;
                            }
                            if (var7_19 < var2_6 && var4_12.ab[var4_12.bj][1] - (var4_12.ab[var4_12.bj][10] >> 1) < var4_12.ab[var8_20][1] - 4 && var4_12.ab[var4_12.bj][1] - (var4_12.ab[var4_12.bj][10] >> 1) > var4_12.ab[var8_20][1] - var4_12.ab[var8_20][10]) {
                                if (var4_12.af[var4_12.bj][0] == 1 && var4_12.ab[var4_12.bj][27] < 3) {
                                    if (var4_12.ab[var4_12.bj][11] == 0) {
                                        var4_12.ab[var4_12.bj][27] = var4_12.c(20) + 1;
                                    }
                                    if (var4_12.ab[var4_12.bj][27] != 2) break;
                                    var4_12.g();
                                    break;
                                }
                                if (var4_12.af[var4_12.bj][0] == 0) {
                                    var4_12.ab[var4_12.bj][4] = 0;
                                    if (var6_15 == 1) {
                                        var4_12.ab[var4_12.bj][4] = 1;
                                    }
                                }
                                if (var4_12.ab[var4_12.bj][4] == var6_15) {
                                    if (var4_12.ab[var8_20][0] - (var4_12.ab[var8_20][9] >> 1) < var4_12.ab[var4_12.bj][0] + (var4_12.ab[var4_12.bj][9] >> 1) && var4_12.ab[var8_20][0] + (var4_12.ab[var8_20][9] >> 1) > var4_12.ab[var4_12.bj][0] - (var4_12.ab[var4_12.bj][9] >> 1)) {
                                        var4_12.ab[var4_12.bj][8] = 0;
                                    }
                                    var4_12.m();
                                    break block277;
                                }
                            }
                        }
                        var8_20 = (byte)(var8_20 + 1);
                    }
                    if (var4_12.af[var4_12.bj][0] != 6) {
                        var10_22 = 0;
                        var11_23 = 3;
                        if (var4_12.ab[var4_12.bj][11] == 0) {
                            var11_23 = 0;
                        }
                        v11 = new byte[3];
                        var1_1 = v11;
                        v11[0] = 0;
                        var1_1[1] = false;
                        var1_1[2] = false;
                        if (var4_12.ab[var4_12.bj][0] < 32) {
                            var4_12.k();
                        } else if (var4_12.ab[var4_12.bj][0] > var4_12.bU) {
                            var4_12.h();
                        } else {
                            if (var4_12.ad[var4_12.bj][0] - 32 > var4_12.ab[var4_12.bj][0]) {
                                var1_1[1] = true;
                            } else if (var4_12.ad[var4_12.bj][0] + 32 < var4_12.ab[var4_12.bj][0]) {
                                var1_1[0] = true;
                            }
                            var9_21 = 0;
                            while (var9_21 < 3) {
                                switch (var4_12.cP[var5_14][var11_23 + var9_21]) {
                                    case 1: {
                                        break;
                                    }
                                    case 2: {
                                        var1_1[var4_12.ab[var4_12.bj][4]] = true;
                                        var1_1[2] = true;
                                        var10_22 = 1;
                                        break;
                                    }
                                    case 3: {
                                        var1_1[var9_21] = false;
                                        break;
                                    }
                                    case 4: {
                                        if (var4_12.af[var4_12.bj][2] != 4) break;
                                        var1_1[var9_21] = true;
                                        break;
                                    }
                                    case 5: {
                                        if (var4_12.af[var4_12.bj][2] != 5) break;
                                        var1_1[var9_21] = true;
                                        break;
                                    }
                                    case -1: {
                                        if (var4_12.af[var4_12.bj][0] != -1) break;
                                        var1_1[var9_21] = false;
                                    }
                                }
                                var9_21 = (byte)(var9_21 + 1);
                            }
                            if (var1_1[0] == false && var1_1[1] == false) {
                                var1_1[var4_12.ab[var4_12.bj][4]] = true;
                            }
                            if (var4_12.af[var4_12.bj][1] == 1 || var10_22 != 0) {
                                if (var1_1[2] == true) {
                                    var4_12.g();
                                }
                                if (var1_1[0] == true) {
                                    var4_12.h();
                                } else if (var1_1[1] == true) {
                                    var4_12.k();
                                }
                            }
                        }
                    }
                }
            }
            var1_1 = this;
            var2_3 = var1_1.cT;
            while (var1_1.aJ[6][var1_1.cR[var1_1.cS][var2_3]] == 0 && var2_3 < var1_1.bI - 1) {
                ++var2_3;
            }
            var1_1.cU[var1_1.bj] = (short)(var2_3 << 4);
            var1_1.cU[var1_1.bj + var1_1.I] = 0;
            if (var1_1.aJ[6][var1_1.cR[var1_1.cS + 1][var2_3]] == 0 || var1_1.aJ[9][var1_1.cR[var1_1.cS + 1][var2_3]] != 0) {
                var1_1.cU[var1_1.bj + var1_1.I] = (short)(var1_1.ab[var1_1.bj][0] - (var1_1.cS << 4) + (var1_1.ab[var1_1.bj][9] >> 1));
            }
            if (var1_1.aJ[6][var1_1.cR[var1_1.cS - 1][var2_3]] == 0 || var1_1.aJ[9][var1_1.cR[var1_1.cS - 1][var2_3]] != 0) {
                var1_1.cU[var1_1.bj + var1_1.I] = (short)(-var1_1.ab[var1_1.bj][0] + (var1_1.cS << 4) + 16 + (var1_1.ab[var1_1.bj][9] >> 1));
            }
            if (this.cq[this.bj] == 1) {
                this.cq[this.bj] = 0;
                if (this.Y == this.bj) {
                    this.m();
                }
            }
            var1_1 = this;
            if (var1_1.az[var1_1.bj][1] == -1) {
                switch (var1_1.az[var1_1.bj][0]) {
                    case -1: {
                        var1_1.ab[var1_1.bj][16] = 1;
                        var1_1.cJ[var1_1.bj] = 0;
                        break;
                    }
                    case 0: {
                        if (var1_1.ab[var1_1.bj][16] != 0 && var1_1.cJ[var1_1.bj] != 1) {
                            var1_1.ab[var1_1.bj][17] = -1;
                        }
                        var1_1.ab[var1_1.bj][16] = 0;
                        var1_1.az[var1_1.bj][0] = -1;
                        break;
                    }
                    case 1: {
                        var1_1.ab[var1_1.bj][16] = 4;
                        var1_1.ab[var1_1.bj][17] = 0;
                        var1_1.cJ[var1_1.bj] = 0;
                        break;
                    }
                    case 2: {
                        var1_1.ab[var1_1.bj][16] = 4;
                        var1_1.ab[var1_1.bj][17] = 1;
                        var1_1.cJ[var1_1.bj] = 0;
                        break;
                    }
                    case 3: {
                        var1_1.ab[var1_1.bj][16] = 4;
                        var1_1.ab[var1_1.bj][17] = 2;
                        var1_1.az[var1_1.bj][0] = -1;
                        var1_1.cJ[var1_1.bj] = 0;
                        break;
                    }
                    case 4: {
                        if (var1_1.ab[var1_1.bj][16] != 5) {
                            var1_1.ab[var1_1.bj][17] = -1;
                        }
                        var1_1.ab[var1_1.bj][16] = 5;
                        var1_1.cJ[var1_1.bj] = 0;
                        if (var1_1.ab[var1_1.bj][2] != 0 || var1_1.ab[var1_1.bj][11] != 0) {
                            var1_1.ab[var1_1.bj][17] = -1;
                            break;
                        }
                        if (var1_1.ab[var1_1.bj][17] <= 0) break;
                        var1_1.ab[var1_1.bj][17] = 0;
                        break;
                    }
                    case 5: {
                        if (var1_1.ab[var1_1.bj][16] != 6) {
                            var1_1.ab[var1_1.bj][17] = -1;
                        }
                        var1_1.ab[var1_1.bj][16] = 6;
                        var1_1.cJ[var1_1.bj] = 0;
                        if (var1_1.ab[var1_1.bj][17] <= 1) break;
                        var1_1.ab[var1_1.bj][17] = 1;
                    }
                }
                if (var1_1.ch[var1_1.bj] == var1_1.cy[var1_1.ab[var1_1.bj][8]]) {
                    var1_1.ab[var1_1.bj][16] = 2;
                    if (var1_1.az[var1_1.bj][0] == 2) {
                        var1_1.ab[var1_1.bj][16] = 8;
                    }
                    if (var1_1.az[var1_1.bj][0] == 1) {
                        var1_1.ab[var1_1.bj][16] = 7;
                    }
                }
            } else if (var1_1.ab[var1_1.bj][17] > -1) {
                var1_1.cJ[var1_1.bj] = 0;
                var1_1.az[var1_1.bj][1] = -1;
                var1_1.az[var1_1.bj][0] = 1;
                var1_1.ab[var1_1.bj][11] = 1;
                if (var1_1.aM[var1_1.bj] == 0) {
                    var1_1.ab[var1_1.bj][3] = -var1_1.bR;
                }
                if (var1_1.aM[var1_1.bj] == -1) {
                    var1_1.ab[var1_1.bj][3] = -var1_1.bR + (var1_1.bR >> 2);
                }
                if (var1_1.aM[var1_1.bj] == 1) {
                    var1_1.ab[var1_1.bj][3] = -var1_1.bR << 1;
                }
            }
            if (var1_1.cJ[var1_1.bj] == 0) {
                v12 = var1_1.ab[var1_1.bj];
                v12[17] = v12[17] + 1;
            }
            if (var1_1.ab[var1_1.bj][17] >= var1_1.bX[var1_1.ab[var1_1.bj][8]][8 + (var1_1.ab[var1_1.bj][16] << 1)]) {
                var1_1.ab[var1_1.bj][17] = 0;
            }
            var1_1 = this;
            if (var1_1.ab[var1_1.bj][12] == 1) {
                var2_3 = 0;
                while (var2_3 < var1_1.ay) {
                    if (var1_1.cd[var2_3][1] == var1_1.cT && var1_1.cd[var2_3][0] == var1_1.cS && var1_1.cd[var2_3][5] == 0) {
                        if (var1_1.Y == var1_1.bj) {
                            var10_22 = 6;
                            e.a(6, false);
                        }
                        var1_1.cd[var2_3][5] = 80;
                        if (var1_1.cd[var2_3][4] > 1 && var1_1.cd[var2_3][4] < 7) {
                            v13 = var1_1.cx[var1_1.bj];
                            v14 = var1_1.cd[var2_3][4] - 1;
                            v13[v14] = (short)(v13[v14] + 30);
                            if (var1_1.cx[var1_1.bj][var1_1.cd[var2_3][4] - 1] > 100) {
                                var1_1.cx[var1_1.bj][var1_1.cd[var2_3][4] - 1] = 100;
                            }
                        } else if (var1_1.cd[var2_3][4] > 8) {
                            var1_1.cd[var2_3][5] = var1_1.cL[var1_1.cd[var2_3][4] - 7];
                            var1_1.cw[var1_1.bj][var1_1.cd[var2_3][4] - 7] = 1;
                            v15 = var1_1.cx[var1_1.bj];
                            v16 = var1_1.cd[var2_3][4] - 7;
                            v15[v16] = (short)(v15[v16] + 30);
                            if (var1_1.ab[var1_1.bj][8] < var1_1.cd[var2_3][4] - 7) {
                                var1_1.ab[var1_1.bj][8] = var1_1.cd[var2_3][4] - 7;
                            }
                            if (var1_1.cx[var1_1.bj][var1_1.cd[var2_3][4] - 7] > 100) {
                                var1_1.cx[var1_1.bj][var1_1.cd[var2_3][4] - 7] = 100;
                            }
                        } else {
                            switch (var1_1.cd[var2_3][4]) {
                                case 0: {
                                    if (var1_1.bj == var1_1.Y) {
                                        var1_1.bA[2] = var1_1.bB;
                                    }
                                    if (var1_1.af[var1_1.bj][0] == 4) {
                                        var1_1.af[var1_1.bj][0] = 1;
                                    }
                                    v17 = var1_1.ab[var1_1.bj];
                                    v17[5] = v17[5] + 30;
                                    if (var1_1.ab[var1_1.bj][5] > var1_1.ab[var1_1.bj][23]) {
                                        var1_1.ab[var1_1.bj][5] = var1_1.ab[var1_1.bj][23];
                                    }
                                    super.b((byte)var1_1.bj);
                                    break;
                                }
                                case 1: {
                                    if (var1_1.bj == var1_1.Y) {
                                        var1_1.bA[3] = var1_1.bB;
                                    }
                                    v18 = var1_1.ab[var1_1.bj];
                                    v18[6] = v18[6] + 30;
                                    if (var1_1.ab[var1_1.bj][6] <= var1_1.ab[var1_1.bj][26]) break;
                                    var1_1.ab[var1_1.bj][6] = var1_1.ab[var1_1.bj][26];
                                    break;
                                }
                                case 7: {
                                    var1_1.aq[var1_1.bj] = 200;
                                    var1_1.cd[var2_3][5] = 200;
                                }
                            }
                        }
                    }
                    ++var2_3;
                }
            }
            if (this.ch[this.bj] > 0) {
                v19 = this.bj;
                this.ch[v19] = (byte)(this.ch[v19] - 1);
            }
            if (this.aq[this.bj] > 0) {
                v20 = this.bj;
                this.aq[v20] = (short)(this.aq[v20] - 1);
            }
            if (this.ab[this.bj][7] > 0) {
                v21 = this.ab[this.bj];
                v21[7] = v21[7] - 1;
            }
            if (this.ab[this.bj][21] > 0) {
                v22 = this.ab[this.bj];
                v22[21] = v22[21] - 1;
            }
            if (this.O[this.bj << 1] == this.F && (this.t == 0 || this.t == 1)) {
                this.c((byte)0);
            }
            if (this.t == 2 && this.O[(this.bj << 1) + 1] == this.D) {
                this.c((byte)1);
            }
            ++this.bj;
        }
        if (this.au == 0 && this.cp <= 0L) {
            if (this.t == 4) {
                this.s();
            } else {
                this.c((byte)2);
            }
        }
        if (this.t == 3) {
            if (this.E == this.cm[0]) {
                this.c((byte)3);
            }
            if (this.E == this.cm[1]) {
                this.c((byte)4);
            }
        }
        if (this.at > 0) {
            if (this.at == 1) {
                var1_1 = this;
                if (0 == var1_1.Y) {
                    var2_3 = 0;
                    while (var2_3 < var1_1.I) {
                        if (0 != var2_3 && var1_1.aM[var2_3] != 0) {
                            var1_1.aM[var2_3] = 0;
                            var1_1.ab[var2_3][18] = var1_1.ab[var2_3][18] << 1;
                            var1_1.cJ[var2_3] = 0;
                        }
                        ++var2_3;
                    }
                } else {
                    var1_1.aM[0] = 0;
                    var1_1.cJ[0] = 0;
                    var1_1.ab[0][18] = var1_1.ab[0][18] >> 1;
                }
            }
            this.at = (short)(this.at - 1);
        }
        this.bj = this.Y;
        var1_1 = this;
        var3_11 = 0;
        var4_13 = 0;
        var3_11 = 0;
        while (var3_11 < 15) {
            if (var1_1.cr[var3_11][6] >= 1) {
                v23 = var1_1.cr[var3_11];
                v23[6] = v23[6] - 1;
                if (var1_1.cr[var3_11][6] < 1) {
                    --var1_1.ct;
                } else {
                    block278: {
                        v24 = var1_1.cr[var3_11][10] = var1_1.cr[var3_11][9] == 4 && var1_1.cr[var3_11][10] == 0 ? 1 : 0;
                        if (var1_1.cr[var3_11][9] == 3) {
                            var1_1.a(var1_1.cr[var3_11][0] - var1_1.cr[var3_11][2], var1_1.cr[var3_11][1] + var1_1.be, (byte)7);
                        }
                        if (var1_1.aM[var1_1.cr[var3_11][5]] == 0) {
                            v25 = var1_1.cr[var3_11];
                            v25[0] = v25[0] + var1_1.cr[var3_11][2];
                        }
                        if (var1_1.aM[var1_1.cr[var3_11][5]] == 1) {
                            v26 = var1_1.cr[var3_11];
                            v26[0] = v26[0] + (var1_1.cr[var3_11][2] << 1);
                        }
                        if (var1_1.aM[var1_1.cr[var3_11][5]] == -1) {
                            v27 = var1_1.cr[var3_11];
                            v27[0] = v27[0] + (var1_1.cr[var3_11][2] >> 1);
                        }
                        var7_19 = var3_11;
                        var6_17 = var1_1;
                        var8_20 = var6_17.cr[var7_19][0] - (var6_17.cr[var7_19][7] >> 1);
                        var9_21 = var6_17.cr[var7_19][1] - (var6_17.cr[var7_19][8] >> 1);
                        var2_3 = var6_17.cr[var7_19][0] + (var6_17.cr[var7_19][7] >> 1);
                        var10_22 = var6_17.cr[var7_19][1] + (var6_17.cr[var7_19][8] >> 1);
                        var11_23 = 0;
                        while (var11_23 < var6_17.I) {
                            if (var6_17.cu[var11_23] != var6_17.cu[var6_17.cr[var7_19][5]] && var6_17.ab[var11_23][12] == 1 && var8_20 < var6_17.ab[var11_23][0] + var6_17.bg && var2_3 > var6_17.ab[var11_23][0] - var6_17.bg && var9_21 < var6_17.ab[var11_23][1] && var10_22 > var6_17.ab[var11_23][1] - var6_17.ab[var11_23][10]) {
                                v28 = (byte)var11_23;
                                break block278;
                            }
                            ++var11_23;
                        }
                        v28 = var4_13 = -1;
                    }
                    if (v28 != -1) {
                        if (var1_1.cr[var3_11][9] < 3) {
                            super.a(var1_1.cr[var3_11][0], var1_1.cr[var3_11][1], (byte)0);
                        } else if (var1_1.cr[var3_11][9] == 3 || var1_1.cr[var3_11][9] == 5) {
                            if (var1_1.Y == var1_1.bj) {
                                var10_22 = 0;
                                e.a(0, false);
                            }
                            super.a(var1_1.ab[var4_13][0], var1_1.ab[var4_13][1], (byte)var1_1.cr[var3_11][9]);
                            if (super.c(2) == 0) {
                                v29 = var1_1.ab[var4_13];
                                v29[21] = v29[21] + 50;
                                var1_1.aT[var4_13] = 43;
                                if (var1_1.ab[var4_13][21] > 200) {
                                    var1_1.ab[var4_13][21] = 200;
                                }
                            }
                        }
                        if (var1_1.cr[var3_11][9] == 4) {
                            super.a(var1_1.ab[var4_13][0], var1_1.ab[var4_13][1], (byte)var1_1.cr[var3_11][9]);
                            if (super.c(2) == 0) {
                                v30 = var1_1.ab[var4_13];
                                v30[21] = v30[21] + 50;
                                var1_1.aT[var4_13] = 46;
                                if (var1_1.ab[var4_13][21] > 100) {
                                    var1_1.ab[var4_13][21] = 100;
                                }
                            }
                        }
                        if (var1_1.cr[var3_11][9] != 5) {
                            var1_1.cr[var3_11][6] = 0;
                            --var1_1.ct;
                        } else if (var1_1.ab[var1_1.cr[var3_11][5]][4] > 0) {
                            var1_1.cr[var3_11][7] = e.g(var1_1.cr[var3_11][0] - (var1_1.cr[var3_11][7] >> 1) - var1_1.ab[var4_13][0]);
                            var1_1.cr[var3_11][0] = var1_1.ab[var4_13][0] - (var1_1.cr[var3_11][7] >> 1);
                        } else {
                            var1_1.cr[var3_11][7] = e.g(var1_1.cr[var3_11][0] + (var1_1.cr[var3_11][7] >> 1) - var1_1.ab[var4_13][0]);
                            var1_1.cr[var3_11][0] = var1_1.ab[var4_13][0] + (var1_1.cr[var3_11][7] >> 1);
                        }
                        v31 = var1_1.ab[var4_13];
                        v31[6] = v31[6] - (var1_1.cr[var3_11][4] >> 2);
                        if (var1_1.ab[var4_13][6] < 0) {
                            v32 = var1_1.ab[var4_13];
                            v32[5] = v32[5] + (var1_1.ab[var4_13][6] << 2);
                            var1_1.ab[var4_13][6] = 0;
                        } else {
                            v33 = var1_1.ab[var4_13];
                            v33[5] = v33[5] - (var1_1.cr[var3_11][4] >> 1);
                        }
                        if (var1_1.ab[var1_1.cr[var3_11][5]][8] == 0 && var1_1.ab[var1_1.cr[var3_11][5]][16] == 2 && var1_1.ab[var1_1.cr[var3_11][5]][17] > 0) {
                            var1_1.ab[var1_1.cr[var3_11][5]][7] = 1;
                        }
                        super.b(var4_13);
                        if (var1_1.ab[var4_13][5] <= 0) {
                            var5_14 = 0;
                            switch (var1_1.cr[var3_11][9]) {
                                case 1: {
                                    var5_14 = var1_1.bR >> 1;
                                    break;
                                }
                                case 2: {
                                    var5_14 = var1_1.bR >> 1;
                                    break;
                                }
                                case 4: {
                                    var5_14 = var1_1.bR >> 1;
                                    break;
                                }
                                case 5: {
                                    var5_14 = (var1_1.bR >> 1) + (var1_1.bR >> 2);
                                }
                            }
                            if (var1_1.ab[var4_13][5] > var1_1.aj) {
                                var1_1.az[var4_13][0] = 4;
                                if (var1_1.cr[var3_11][2] > 0) {
                                    var1_1.ab[var4_13][2] = var5_14;
                                    var1_1.ab[var4_13][4] = 0;
                                } else {
                                    var1_1.ab[var4_13][2] = -var5_14;
                                    var1_1.ab[var4_13][4] = 1;
                                }
                            } else {
                                var1_1.az[var4_13][0] = 5;
                            }
                            var1_1.ab[var4_13][21] = 0;
                            var1_1.az[var4_13][1] = -1;
                            var1_1.ab[var4_13][5] = 0;
                            var1_1.ab[var4_13][12] = 0;
                            var1_1.aQ[var4_13] = var1_1.cK;
                            if (var1_1.t == 4) {
                                super.e(var4_13);
                            } else {
                                v34 = var1_1.cr[var3_11][5] << 1;
                                var1_1.O[v34] = (byte)(var1_1.O[v34] + 1);
                            }
                            v35 = (var4_13 << 1) + 1;
                            var1_1.O[v35] = (byte)(var1_1.O[v35] + 1);
                            if (var1_1.aU[0][2] == var4_13) {
                                var1_1.aU[0][2] = -1;
                            }
                            if (var1_1.aU[1][2] == var4_13) {
                                var1_1.aU[1][2] = -1;
                            }
                            if (var1_1.Y == var4_13) {
                                var10_22 = 4;
                                e.a(4, false);
                                e.v();
                            }
                        }
                    }
                }
            }
            ++var3_11;
        }
        var1_1 = this;
        var2_3 = 0;
        var7_19 = 0;
        while (var7_19 < var1_1.ay) {
            if (var1_1.cd[var7_19][5] > 0) {
                v36 = var1_1.cd[var7_19];
                v36[5] = v36[5] - 1;
            }
            ++var7_19;
        }
        if (var1_1.t == 3) {
            while (var2_3 < 2) {
                var3_11 = var1_1.aU[var2_3][0];
                var4_13 = var1_1.aU[var2_3][1] - var1_1.aO[var1_1.ao + var2_3][3];
                var5_14 = var1_1.aU[var2_3][0] + var1_1.aO[var1_1.ao + var2_3][2];
                var6_18 = var1_1.aU[var2_3][1] + var1_1.aO[98][3];
                var8_20 = var3_11 >> 4;
                var9_21 = var1_1.aU[var2_3][1] + var1_1.aO[98][3] >> 4;
                var7_19 = 0;
                while (var7_19 < var1_1.I) {
                    if (var1_1.ab[var7_19][12] == 1 && var3_11 < var1_1.ab[var7_19][0] + (var1_1.ab[var7_19][9] >> 1) && var5_14 > var1_1.ab[var7_19][0] - (var1_1.ab[var7_19][9] >> 1) && var4_13 < var1_1.ab[var7_19][1] && var6_18 > var1_1.ab[var7_19][1] - var1_1.ab[var7_19][10]) {
                        if (var1_1.cu[var7_19] == 0) {
                            if (var2_3 == 0) {
                                if (var1_1.aU[var2_3][0] != var1_1.aW[var2_3][0] + (var1_1.aO[var1_1.ao - 1][2] >> 1) - 3 || var1_1.aU[var2_3][1] != var1_1.aW[var2_3][1] - var1_1.aO[98][3] + (var1_1.aO[var1_1.ao - 1][3] >> 1) - 3) {
                                    var1_1.aU[var2_3][0] = var1_1.aW[var2_3][0] + (var1_1.aO[var1_1.ao - 1][2] >> 1) - 3;
                                    var1_1.aU[var2_3][1] = var1_1.aW[var2_3][1] - var1_1.aO[98][3] + (var1_1.aO[var1_1.ao - 1][3] >> 1) - 3;
                                } else if (var1_1.aU[1][2] == var7_19) {
                                    var1_1.bA[var2_3] = var1_1.bB;
                                    v37 = var2_3;
                                    var1_1.cm[v37] = (byte)(var1_1.cm[v37] + 1);
                                    var1_1.aU[1][0] = var1_1.aW[1][0];
                                    var1_1.aU[1][1] = var1_1.aW[1][1];
                                    var1_1.af[var1_1.aU[1][2]][0] = 0;
                                    var1_1.aU[1][2] = -1;
                                }
                            } else if (var1_1.aU[var2_3][2] == -1) {
                                var1_1.aU[var2_3][2] = var7_19;
                                var1_1.af[var7_19][0] = 5;
                                if (var1_1.Y == var7_19) {
                                    e.v();
                                }
                                if (var1_1.L) {
                                    var10_22 = 3;
                                    e.a(3, false);
                                } else {
                                    var10_22 = 2;
                                    e.a(2, false);
                                }
                            }
                        } else if (var2_3 == 1) {
                            if (var1_1.aU[var2_3][0] != var1_1.aW[var2_3][0] + (var1_1.aO[var1_1.ao - 1][2] >> 1) - 3 || var1_1.aU[var2_3][1] != var1_1.aW[var2_3][1] - var1_1.aO[98][3] + (var1_1.aO[var1_1.ao - 1][3] >> 1) - 3) {
                                var1_1.aU[var2_3][0] = var1_1.aW[var2_3][0] + (var1_1.aO[var1_1.ao - 1][2] >> 1) - 3;
                                var1_1.aU[var2_3][1] = var1_1.aW[var2_3][1] - var1_1.aO[98][3] + (var1_1.aO[var1_1.ao - 1][3] >> 1) - 3;
                            } else if (var1_1.aU[0][2] == var7_19) {
                                var1_1.bA[var2_3] = var1_1.bB;
                                v38 = var2_3;
                                var1_1.cm[v38] = (byte)(var1_1.cm[v38] + 1);
                                var1_1.aU[0][0] = var1_1.aW[0][0];
                                var1_1.aU[0][1] = var1_1.aW[0][1];
                                var1_1.af[var1_1.aU[0][2]][0] = 0;
                                var1_1.aU[0][2] = -1;
                            }
                        } else if (var1_1.aU[var2_3][2] == -1) {
                            var1_1.aU[var2_3][2] = var7_19;
                            var1_1.af[var7_19][0] = 5;
                            if (var1_1.Y == var7_19) {
                                e.v();
                            }
                            if (var1_1.L) {
                                var10_22 = 2;
                                e.a(2, false);
                            } else {
                                var10_22 = 3;
                                e.a(3, false);
                            }
                        }
                    }
                    if (var1_1.aU[var2_3][2] != -1) {
                        var1_1.aU[var2_3][0] = var1_1.ab[var1_1.aU[var2_3][2]][0];
                        var1_1.aU[var2_3][1] = var1_1.ab[var1_1.aU[var2_3][2]][1] - var1_1.ab[var1_1.aU[var2_3][2]][10] - (var1_1.aO[98][3] >> 1);
                    } else if (var9_21 > var1_1.bI - 3) {
                        var1_1.aU[var2_3][0] = var1_1.aW[var2_3][0] + (var1_1.aO[var1_1.ao - 1][2] >> 1) - 3;
                        var1_1.aU[var2_3][1] = var1_1.aW[var2_3][1] - var1_1.aO[98][3] + (var1_1.aO[var1_1.ao - 1][3] >> 1) - 3;
                    } else if (var1_1.aJ[6][var1_1.cR[var8_20][var9_21]] == 0) {
                        v39 = var1_1.aU[var2_3];
                        v39[1] = v39[1] + 2;
                    }
                    ++var7_19;
                }
                var2_3 = (byte)(var2_3 + 1);
            }
        }
        var1_1 = this;
        var2_3 = 0;
        var3_11 = 0;
        while (var2_3 < var1_1.cD) {
            if (var1_1.cC[var3_11][3] < 1) {
                ++var3_11;
                continue;
            }
            v40 = var1_1.cC[var3_11];
            v40[3] = v40[3] - 1;
            if (var1_1.cC[var3_11][3] < 1) {
                --var1_1.cD;
                continue;
            }
            if ((var1_1.cC[var3_11][2] == 2 || var1_1.cC[var3_11][2] == 3) && var1_1.cC[var3_11][3] == var1_1.ap[var1_1.cC[var3_11][2]].length) {
                var4_13 = 0;
                while (var4_13 < var1_1.I) {
                    if (var1_1.ab[var4_13][12] != 0 && (var5_14 = e.g(var1_1.ab[var4_13][0] - var1_1.cC[var3_11][0]) + e.g(var1_1.ab[var4_13][1] - var1_1.bh - var1_1.cC[var3_11][1])) < var1_1.ar) {
                        if (var1_1.c(2) == 0) {
                            v41 = var1_1.ab[var4_13];
                            v41[21] = v41[21] + 50;
                            var1_1.aT[var4_13] = 43;
                            if (var1_1.ab[var4_13][21] > 100) {
                                var1_1.ab[var4_13][21] = 100;
                            }
                        }
                        var1_1.ab[var4_13][2] = var1_1.ab[var4_13][0] - var1_1.cC[var3_11][0] > 0 ? (var1_1.bR >> 1) + (var1_1.bR >> 2) : -(var1_1.bR >> 1) - (var1_1.bR >> 2);
                        var5_14 = var1_1.ag - var5_14 < 0 ? 0 : var1_1.ag - var5_14;
                        v42 = var1_1.ab[var4_13];
                        v42[6] = v42[6] - var5_14;
                        if (var1_1.ab[var4_13][6] < 0) {
                            v43 = var1_1.ab[var4_13];
                            v43[5] = v43[5] + (var1_1.ab[var4_13][6] << 2);
                            var1_1.ab[var4_13][6] = 0;
                        } else {
                            v44 = var1_1.ab[var4_13];
                            v44[5] = v44[5] - (var5_14 >> 1);
                        }
                        super.b(var4_13);
                        if (var1_1.ab[var4_13][5] <= 0) {
                            if (var1_1.ab[var4_13][12] == 1 && var1_1.ab[var4_13][5] > var1_1.aj && var1_1.az[var4_13][0] != 4) {
                                var1_1.az[var4_13][0] = 4;
                                if (var1_1.ab[var4_13][0] - var1_1.cC[var3_11][0] > 0) {
                                    var1_1.ab[var4_13][2] = var1_1.bR;
                                    var1_1.ab[var4_13][4] = 0;
                                } else {
                                    var1_1.ab[var4_13][2] = -var1_1.bR;
                                    var1_1.ab[var4_13][4] = 1;
                                }
                            } else {
                                var1_1.az[var4_13][0] = 5;
                            }
                            var1_1.ab[var4_13][21] = 0;
                            var1_1.az[var4_13][1] = -1;
                            var1_1.ab[var4_13][5] = 0;
                            var1_1.ab[var4_13][12] = 0;
                            var1_1.aQ[var4_13] = var1_1.cK;
                            if (var4_13 == var1_1.cC[var3_11][6]) {
                                v45 = var4_13 << 1;
                                var1_1.O[v45] = (byte)(var1_1.O[v45] - 2);
                            }
                            if (var1_1.t == 4) {
                                super.e(var4_13);
                            } else {
                                v46 = var1_1.cC[var3_11][6] << 1;
                                var1_1.O[v46] = (byte)(var1_1.O[v46] + 1);
                            }
                            v47 = (var4_13 << 1) + 1;
                            var1_1.O[v47] = (byte)(var1_1.O[v47] + 1);
                            if (var1_1.aU[0][2] == var4_13) {
                                var1_1.aU[0][2] = -1;
                            }
                            if (var1_1.aU[1][2] == var4_13) {
                                var1_1.aU[1][2] = -1;
                            }
                        }
                    }
                    var4_13 = (byte)(var4_13 + 1);
                }
            }
            ++var2_3;
            ++var3_11;
        }
        var1_1 = this;
        var1_1.cf = var1_1.ab[var1_1.bj][4] == 1 ? (var1_1.cf + var1_1.bR < var1_1.ab[var1_1.bj][0] - var1_1.av ? (var1_1.cf += var1_1.bR) : var1_1.ab[var1_1.bj][0] - var1_1.av) : (var1_1.cf - var1_1.bR > var1_1.ab[var1_1.bj][0] - var1_1.e + var1_1.av ? (var1_1.cf -= var1_1.bR) : var1_1.ab[var1_1.bj][0] - var1_1.e + var1_1.av);
        if (var1_1.aI) {
            if (var1_1.cg + var1_1.bR < var1_1.ab[var1_1.bj][1] - var1_1.ab[var1_1.bj][10]) {
                var1_1.cg += var1_1.bR;
            }
        } else {
            var1_1.cg = var1_1.cg - var1_1.bR > var1_1.ab[var1_1.bj][1] - var1_1.b + var1_1.ab[var1_1.bj][10] ? (var1_1.cg -= var1_1.bR) : var1_1.ab[var1_1.bj][1] - (var1_1.b - var1_1.ab[var1_1.bj][10]);
        }
        var1_1.aI = false;
        if (var1_1.cg < 0) {
            var1_1.cg = 0;
        }
        if (var1_1.cg > var1_1.bM) {
            var1_1.cg = var1_1.bM;
        }
        if (var1_1.cf < 0) {
            var1_1.cf = 0;
        } else if (var1_1.cf > var1_1.bL) {
            var1_1.cf = var1_1.bL;
        }
        if (this.be > 1 || this.be < -1) {
            this.bb = -this.bb;
        }
        this.aV = (byte)(this.aV + 1);
        if (this.aV > 2) {
            this.aV = 0;
        }
        this.be = (byte)(this.be + this.bb);
        if (this.cM > 0) {
            this.cM = (byte)(this.cM - 1);
        }
        var1_2 = 0;
        while (var1_2 < 4) {
            if (this.bA[var1_2] > 0) {
                v48 = var1_2;
                this.bA[v48] = (byte)(this.bA[v48] - 1);
            }
            ++var1_2;
        }
    }

    private final void j() {
        this.cS = this.ab[this.bj][0] >> 4;
        this.cT = this.ab[this.bj][1] >> 4;
        if (this.cS > this.bH - 2) {
            this.cS = this.bH - 2;
            this.ab[this.bj][0] = (this.cS << 4) + 16;
        }
        if (this.cS < 1) {
            this.cS = 1;
            this.ab[this.bj][0] = this.cS << 4;
        }
        if (this.cT > this.bI - 2) {
            if (this.cT > this.bI - 2) {
                int n;
                this.ab[this.bj][5] = 0;
                if (this.ab[this.bj][12] == 1) {
                    if (this.Y == this.bj) {
                        n = 4;
                        e.a(4, false);
                        e.v();
                    }
                    this.aQ[this.bj] = this.cK;
                    this.ab[this.bj][12] = 0;
                    int n2 = (this.bj << 1) + 1;
                    this.O[n2] = (byte)(this.O[n2] + 1);
                    if (this.t == 4) {
                        this.e(this.bj);
                    }
                }
                this.ab[this.bj][21] = 0;
                this.az[this.bj][0] = 4;
                n = 0;
                if (this.cu[this.bj] == 0) {
                    n = 1;
                }
                if (this.aU[n][2] == this.bj) {
                    this.aU[n][2] = -1;
                    this.aU[n][0] = this.aW[n][0] + (this.aO[this.ao - 1][2] >> 1);
                    this.aU[n][1] = this.aW[n][1] - this.aO[98][3] + (this.aO[this.ao - 1][3] >> 1);
                }
            }
            this.cT = this.bI - 1;
        }
        this.aw = 16 * this.cS;
        this.ax = 16 * this.cT;
    }

    private final void k() {
        this.ab[this.bj][4] = 1;
        if (this.aM[this.bj] == 0) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] + (this.bc << 1);
        }
        if (this.aM[this.bj] == -1) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] + this.bc;
        }
        if (this.aM[this.bj] == 1) {
            int[] nArray = this.ab[this.bj];
            nArray[2] = nArray[2] + (this.bc << 2);
        }
        if (this.ab[this.bj][2] > this.ab[this.bj][18]) {
            this.ab[this.bj][2] = this.ab[this.bj][18];
        }
        if (this.ab[this.bj][11] == 0) {
            this.az[this.bj][0] = 0;
        }
    }

    private final int c(int n) {
        return Math.abs(this.bY.nextInt() % n);
    }

    private void l() {
        long l;
        long l2 = System.currentTimeMillis();
        this.repaint();
        this.serviceRepaints();
        long l3 = System.currentTimeMillis();
        this.cG = l = l3 - l2;
        long l4 = this.W;
        if (l < l4) {
            try {
                Thread.sleep(l4 - l);
                return;
            }
            catch (Exception exception) {}
        }
    }

    private final void m() {
        byte by = (byte)this.ab[this.bj][8];
        if (by == 0 && this.ab[this.bj][11] == 1 || this.ct == 15) {
            return;
        }
        if (this.ch[this.bj] == 0 && this.cx[this.bj][by] > 0) {
            int n = 0;
            this.ch[this.bj] = this.cy[by];
            ++this.ct;
            if (by > 0) {
                short[] sArray = this.cx[this.bj];
                byte by2 = by;
                sArray[by2] = (short)(sArray[by2] - 1);
            }
            while (true) {
                if (this.cr[n][6] < 1) {
                    int n2 = this.bX[this.ab[this.bj][8]][0] + this.bX[this.ab[this.bj][8]][11] + this.ab[this.bj][20];
                    if (this.ab[this.bj][11] == 1) {
                        n2 += 11;
                    }
                    byte by3 = (byte)(this.ab[this.bj][4] == 1 ? 1 : -1);
                    this.cr[n][2] = this.cs * by3;
                    if (by != 0) {
                        this.cr[n][0] = this.ab[this.bj][0] + this.aH[n2][this.aH[n2].length - 3] * by3;
                        this.cr[n][1] = this.ab[this.bj][1] + this.aH[n2][this.aH[n2].length - 2] - (by != 5 ? (this.aO[this.cQ[by]][3] >> 1) + 1 : 3);
                    } else {
                        this.cr[n][0] = this.ab[this.bj][0];
                        this.cr[n][1] = this.ab[this.bj][1] - this.bh;
                    }
                    if (by != 5) {
                        this.cr[n][7] = this.aO[this.cQ[by]][2];
                        this.cr[n][8] = this.aO[this.cQ[by]][3];
                    }
                    this.cr[n][5] = this.bj;
                    this.cr[n][9] = by;
                    switch (by) {
                        case 0: {
                            this.cr[n][4] = this.ak;
                            this.cr[n][6] = 2;
                            this.cr[n][7] = 20;
                            this.cr[n][8] = 5;
                            if (this.Y != this.bj) break;
                            n2 = 8;
                            e.a(8, false);
                            break;
                        }
                        case 1: {
                            this.cr[n][4] = this.ai;
                            this.cr[n][6] = 20;
                            break;
                        }
                        case 2: {
                            this.cr[n][4] = this.ah;
                            this.cr[n][6] = 20;
                            break;
                        }
                        case 3: {
                            this.cr[n][4] = 0;
                            this.cr[n][6] = 20;
                            int n3 = this.ab[this.bj][2] = this.ab[this.bj][4] == 0 ? this.bR >> 1 : -this.bR >> 1;
                            if (this.Y != this.bj) break;
                            n2 = 1;
                            e.a(1, false);
                            break;
                        }
                        case 4: {
                            this.cr[n][4] = this.al;
                            this.cr[n][6] = 20;
                            break;
                        }
                        case 5: {
                            this.cr[n][2] = 0;
                            this.cr[n][4] = this.am;
                            this.cr[n][6] = 2;
                            this.cr[n][7] = this.e;
                            this.cr[n][8] = 5;
                            int[] nArray = this.cr[n];
                            nArray[0] = nArray[0] + (this.ab[this.bj][4] == 0 ? -this.e >> 1 : this.e >> 1);
                            if (this.Y != this.bj) break;
                            n2 = 5;
                            e.a(5, false);
                        }
                    }
                    if (this.aq[this.bj] <= 0) break;
                    int[] nArray = this.cr[n];
                    nArray[4] = nArray[4] * 3;
                    break;
                }
                ++n;
            }
        }
        if (this.cx[this.bj][by] == 0) {
            this.t();
        }
    }

    private final boolean n() {
        if (this.ab[this.bj][11] == 0 && this.aJ[9][this.cR[this.cS][this.cT]] != 0) {
            if (this.aJ[9][this.cR[this.cS][this.cT]] == 2) {
                this.ab[this.bj][1] = this.ax + (this.ab[this.bj][0] - this.aw >> 1) + this.aJ[6][this.cR[this.cS][this.cT]];
                return true;
            }
            if (this.aJ[9][this.cR[this.cS][this.cT]] == -2) {
                this.ab[this.bj][1] = this.ax + (-this.ab[this.bj][0] + this.aw + 16 >> 1) + this.aJ[6][this.cR[this.cS][this.cT]];
                return true;
            }
            return true;
        }
        return false;
    }

    private static int a(byte n) {
        int n2 = n;
        if (n < 0) {
            n2 = n + 256;
        }
        return n2;
    }

    private static Image a(Image object, int n, int n2, int n3, int n4, int n5) {
        n = n3;
        n2 = n4;
        Object object2 = Image.createImage((int)n, (int)n2);
        Image image = Image.createImage((int)n, (int)n2);
        Object object3 = object2.getGraphics();
        object3.setColor(0);
        object3.fillRect(0, 0, n, n2);
        object3.drawImage(object, 0, 0, 20);
        object3 = image.getGraphics();
        object3.setColor(0xFFFFFF);
        object3.fillRect(0, 0, n, n2);
        object3.drawImage(object, 0, 0, 20);
        object = new int[n * n2];
        object2.getRGB((int[])object, 0, n, 0, 0, n, n2);
        object2 = new int[n * n2];
        image.getRGB((int[])object2, 0, n, 0, 0, n, n2);
        n = 0;
        while (n < ((Image)object).length) {
            if ((object[n] & 0xFFFFFF) <= 0x202020 && (object2[n] & 0xFFFFFF) >= 0xDFDFDF) {
                object[n] = (Image)false;
            }
            ++n;
        }
        image = object;
        object3 = new int[((Image)image).length];
        int n6 = 0;
        n = 0;
        while (n < n4) {
            n2 = n3 - 1;
            int n7 = 0;
            while (n7 < n3) {
                object3[n6 * n3 + n2] = image[n * n3 + n7];
                --n2;
                ++n7;
            }
            ++n6;
            ++n;
        }
        return Image.createRGBImage((int[])object3, (int)n3, (int)n4, (boolean)true);
    }

    private final void o() {
        try {
            this.k = b.a("/curs.png");
        }
        catch (Exception exception) {}
        try {
            this.p = b.a("/erou.png");
        }
        catch (Exception exception) {}
        try {
            this.w = b.a("/ld.png");
        }
        catch (Exception exception) {}
        this.cb = new Image[this.br];
        int n = 0;
        while (n < this.cb.length) {
            try {
                this.cb[n] = b.a("/s" + n + ".png");
            }
            catch (Exception exception) {}
            ++n;
        }
        this.r();
    }

    private final void a(Graphics graphics, int n, int n2, int n3, int n4, int n5, boolean bl) {
        int n6 = (this.cN + 1) * e.g(n5) + 8;
        if (bl) {
            n -= n6;
            if (n5 < 0) {
                n -= n6;
            }
        }
        graphics.setColor(n4);
        graphics.fillRect(n, n2, n6, this.bf + 6);
        graphics.setColor(n3);
        graphics.drawRect(n + 1, n2 + 1, n6 - 2, this.bf + 4);
        graphics.setColor(0);
        graphics.drawRect(n, n2, n6, this.bf + 6);
    }

    private final void a(Graphics graphics) {
        int n = this.cf + this.e;
        int n2 = this.cg + this.b;
        int n3 = this.aO[this.ao + 1][2] >> 1;
        byte by = 1;
        int n4 = 0;
        if (this.t == 3) {
            if (this.aW[0][0] + 16 > this.cf && this.aW[0][0] < n && this.aW[0][1] > this.cg && this.aW[0][1] < n2) {
                this.b(graphics, this.ao + 3, this.aW[0][0] - this.cf - 2, this.aW[0][1] - this.cg - 3);
            }
            if (this.aU[0][0] + n3 > this.cf && this.aU[0][0] - n3 < n && this.aU[0][1] > this.cg && this.aU[0][1] - this.aO[103][3] < n2) {
                n4 = this.aO[this.ao + 1][2];
                if (this.aU[0][2] != -1 && (by = this.ab[this.aU[0][2]][4] == 1 ? (byte)1 : -1) == -1) {
                    n4 = 2;
                }
                this.a(graphics, this.ao + this.aV, this.aU[0][0] - this.cf - n4 + 2, this.aU[0][1] - this.cg - this.aO[103][3] - 2, by);
                this.a(graphics, 98, this.aU[0][0] - this.cf, this.aU[0][1] - this.cg - 2, by);
            }
            if (this.aW[1][0] + 16 > this.cf && this.aW[1][0] < n && this.aW[1][1] > this.cg && this.aW[1][1] < n2) {
                this.b(graphics, this.ao - 1, this.aW[1][0] - this.cf - 2, this.aW[1][1] - this.cg - 3);
            }
            if (this.aU[1][0] + n3 > this.cf && this.aU[1][0] - n3 < n && this.aU[1][1] > this.cg && this.aU[1][1] - this.aO[103][3] < n2) {
                n4 = this.aO[this.ao + 1][2];
                if (this.aU[1][2] != -1 && (by = this.ab[this.aU[1][2]][4] == 1 ? (byte)1 : -1) == -1) {
                    n4 = 2;
                }
                this.a(graphics, this.ao + this.aV - 4, this.aU[1][0] - this.cf - n4 + 2, this.aU[1][1] - this.cg - this.aO[103][3] - 2, by);
                this.a(graphics, 98, this.aU[1][0] - this.cf, this.aU[1][1] - this.cg - 2, by);
            }
        }
        graphics.setColor(0);
        n = 0;
        while (n < this.ay) {
            if (this.cd[n][5] == 0 && this.cd[n][2] + 32 > this.cf && this.cd[n][2] < this.cf + this.e && this.cd[n][3] + 16 > this.cg && this.cd[n][3] - 16 < this.cg + this.b) {
                graphics.setClip(0, 0, this.e, this.b);
                graphics.fillRoundRect(this.cd[n][2] - this.cf - (this.be >> 2), this.cd[n][3] - this.cg + 4 - 2, this.aO[this.cd[n][4] + 69][2] + (this.be >> 1), 4, (int)this.aO[this.cd[n][4] + 69][3], (int)this.aO[this.cd[n][4] + 69][3]);
                this.b(graphics, this.cd[n][4] + 69, this.cd[n][2] - this.cf, this.cd[n][3] - this.cg - this.aO[this.cd[n][4] + 69][3] + this.be);
            }
            ++n;
        }
    }

    private final void b(Graphics graphics) {
        int n = 0;
        int n2 = 0;
        while (n < this.ct) {
            if (this.cr[n2][6] == 0) {
                ++n2;
                continue;
            }
            if (this.cr[n2][9] == 5) {
                graphics.setClip(0, 0, this.e, this.b);
                graphics.setColor(0xFF0000);
                graphics.fillRect(this.cr[n2][0] - this.cf - (this.cr[n2][7] >> 1), this.cr[n2][1] - this.cg - (this.cr[n2][8] >> 1), this.cr[n2][7], this.cr[n2][8]);
                graphics.setColor(0xFFFF00);
                graphics.fillRect(this.cr[n2][0] - this.cf - (this.cr[n2][7] >> 1), this.cr[n2][1] - this.cg - (this.cr[n2][8] >> 2) + 1, this.cr[n2][7], (this.cr[n2][8] >> 1) - 1);
            } else if (this.cr[n2][9] != 0 && this.cr[n2][0] > this.cf && this.cr[n2][0] < this.cf + this.e && this.cr[n2][1] > this.cg && this.cr[n2][1] < this.cg + this.b) {
                this.a(graphics, 60 + this.cr[n2][9] + this.cr[n2][10], this.cr[n2][0] - this.cf - (this.cr[n2][7] >> 1), this.cr[n2][1] - this.cg - (this.cr[n2][8] >> 1), (byte)(this.cr[n2][2] > 0 || this.cr[n2][9] == 1 ? 1 : -1));
            }
            ++n;
            ++n2;
        }
        graphics.setClip(0, 0, this.e, this.b);
    }

    private final void c(Graphics graphics) {
        int n = 0;
        int n2 = 0;
        while (n < this.cD) {
            if (this.cC[n2][3] == 0) {
                ++n2;
                continue;
            }
            if (this.cC[n2][0] > this.cf && this.cC[n2][0] < this.cf + this.e && this.cC[n2][1] > this.cg && this.cC[n2][1] < this.cg + this.b) {
                byte by = this.ap[this.cC[n2][2]][this.cC[n2][3] - 1];
                this.b(graphics, by, this.cC[n2][0] - this.cf - (this.aO[by][2] >> 1), this.cC[n2][1] - this.cg - (this.cC[n2][2] == 7 ? this.aO[by][3] >> 1 : this.aO[by][3]));
            }
            ++n;
            ++n2;
        }
    }

    private final void a(Graphics graphics, String string, int n, int n2) {
        if (string.charAt(0) == '0') {
            this.a(graphics, string.charAt(0) - 37, n, n2);
            return;
        }
        byte by = (byte)string.length();
        byte by2 = 0;
        while (by2 < by) {
            this.a(graphics, string.charAt(by2) - 47, n + by2 * (this.h[2][1] + 1), n2);
            by2 = (byte)(by2 + 1);
        }
    }

    private final void d(Graphics graphics) {
        graphics.setColor(0);
        int n = 0;
        while (n < this.I) {
            if (this.ab[n][0] + this.ab[n][9] > this.cf && this.ab[n][0] - this.ab[n][9] < this.cf + this.e && this.ab[n][1] > this.cg && this.ab[n][1] - this.ab[n][10] < this.cg + this.b) {
                graphics.setClip(0, 0, this.e, this.b);
                int n2 = this.ab[n][0] - this.cf;
                int n3 = this.ab[n][1] - this.cg;
                int n4 = this.bX[this.ab[n][8]][0] + this.bX[this.ab[n][8]][7 + (this.ab[n][16] << 1)] + this.ab[n][17] + this.ab[n][20];
                byte by = (byte)(this.ab[n][4] == 0 ? -1 : 1);
                int n5 = this.aH[n4].length;
                if (this.ab[n][8] == 0 && this.ab[n][7] == 0 && this.ab[n][16] == 2 && this.ab[n][17] > 0) {
                    n5 -= 3;
                }
                if (this.ab[n][12] == 1) {
                    if (this.t == 3 || this.t == 1) {
                        this.ab[n][25] = this.cu[n] == 0 ? 255 : 0xFF0000;
                    }
                    graphics.setColor(this.ab[n][25]);
                    graphics.fillRect(n2 - this.bg + 1, n3 - this.ab[n][10] - 10, this.ab[n][24] - 1, 5);
                    graphics.setColor(0);
                    graphics.drawRect(n2 - this.bg, n3 - this.ab[n][10] - 10, this.ab[n][9] - 1, 5);
                    if (this.cU[n] != (this.bI << 4) - 16) {
                        graphics.fillRoundRect(n2 - this.bg + (this.cU[n] - this.ab[n][1] >> 1) + (this.cU[n + this.I] >> 1), this.cU[n] - this.cg, this.ab[n][9] - (this.cU[n] - this.ab[n][1]) - this.cU[n + this.I], 8, 100, 100);
                    }
                }
                int n6 = 0;
                while (n6 < n5) {
                    byte by2 = by;
                    int n7 = this.aH[n4][n6 + 1] + n3;
                    int n8 = by * this.aH[n4][n6] + n2;
                    short s = this.aH[n4][n6 + 2];
                    Graphics graphics2 = graphics;
                    e e2 = this;
                    n7 -= e2.aO[s][3];
                    int n9 = e2.aO[s][0];
                    int n10 = 0;
                    if (by2 == -1) {
                        n8 -= e2.aO[s][2];
                        n9 = e2.cc[e2.aO[s][e2.bx - 1]].getWidth() - e2.aO[s][2] - e2.aO[s][0];
                        n10 = e2.bs;
                    }
                    graphics2.setClip(n8, n7, (int)e2.aO[s][2], (int)e2.aO[s][3]);
                    graphics2.drawImage(e2.cc[e2.aO[s][e2.bx - 1] + n10], n8 - n9, n7 - e2.aO[s][1], 20);
                    n6 += 3;
                }
                if (this.ab[n][21] > 0) {
                    if (this.ab[n][11] == 0) {
                        this.a(graphics, this.aT[n] + this.aS[n], n2, n3 - this.aO[46][3], by);
                    } else {
                        this.a(graphics, this.aT[n] + this.aS[n], n2, n3 - this.aO[46][3] - 12, by);
                    }
                    int n11 = n;
                    this.aS[n11] = (byte)(this.aS[n11] + 1);
                    if (this.aS[n] > 2) {
                        this.aS[n] = 0;
                    }
                }
            }
            ++n;
        }
    }

    private void a(Graphics graphics, int n, int n2) {
        int n3;
        int n4;
        int n5;
        int n6;
        if (e.n == 2) {
            if (this.aB != null) {
                n6 = this.aB.getWidth() * this.cf / (this.bL + this.e);
                graphics.setClip(0, 0, this.e, this.b);
                n4 = n5 = n6 / this.aB.getWidth();
                while (n4 < n5 + this.aE + 2) {
                    graphics.drawImage(this.aB, n4 * this.aF - n6, this.bM <= 0 ? 0 : -(this.cg * (this.aB.getHeight() - this.b)) / this.bM, 20);
                    ++n4;
                }
            }
        } else if (e.n == 1) {
            n6 = this.bM <= 0 ? 0 : -(this.cg * (this.cz * this.bS - this.b)) / this.bM;
            n4 = 0;
            while (n4 < this.bS) {
                n5 = n6 + n4 * this.cz;
                if (n5 < this.b && n5 + this.cz > 0) {
                    n3 = 0;
                    while (n3 < this.cB) {
                        graphics.drawImage(this.aC[n4], n3 * this.cA, n5, 20);
                        ++n3;
                    }
                }
                ++n4;
            }
        } else {
            graphics.setColor(0, this.aY, 0);
            graphics.fillRect(0, 0, this.e, this.b);
        }
        n6 = n >> 4;
        n5 = n2 >> 4;
        n4 = this.bE + n6 + 2;
        n3 = this.bF + n5 + 2;
        if (n5 < 0) {
            n5 = 0;
        }
        int n7 = n6;
        n = (n6 << 4) - n;
        while (n7 < n4 && n7 < this.bH) {
            n6 = n5;
            int n8 = (n5 << 4) - n2;
            while (n6 < n3 && n6 < this.bI) {
                if (this.cR[n7][n6] != 0) {
                    int n9 = n8;
                    int n10 = n;
                    byte by = this.cR[n7][n6];
                    Graphics graphics2 = graphics;
                    e e2 = this;
                    graphics2.setClip(n10 += e2.aJ[4][by], n9 += e2.aJ[5][by], (int)e2.aJ[2][by], (int)e2.aJ[3][by]);
                    graphics2.drawImage(e2.ca[e2.aJ[e2.bu - 1][by]], n10 - e2.aJ[0][by], n9 - e2.aJ[1][by], 20);
                }
                ++n6;
                n8 += 16;
            }
            ++n7;
            n += 16;
        }
    }

    private static void a(Graphics graphics, int n, int n2, int n3, int n4, int n5, int n6) {
        n = 1;
        try {
            n2 = 0 + (100 << 24);
            if (Display.getDisplay((MIDlet)tr.a).numAlphaLevels() > 2) {
                if (aR == null || aR.length != n3 * n4 || aR[0] != n2) {
                    if (aR == null || aR.length != n3 * n4) {
                        aR = new int[n3 * n4];
                    }
                    n5 = 0;
                    while (n5 < aR.length) {
                        e.aR[n5] = n2;
                        ++n5;
                    }
                }
                graphics.drawRGB(aR, 0, 0, 0, 0, n3, n4, true);
                n = 0;
            }
        }
        catch (Exception exception) {
            aR = null;
        }
        if (n != 0) {
            try {
                graphics.setColor(0);
                graphics.fillRect(0, 0, n3, n4);
                return;
            }
            catch (Exception exception) {}
        }
    }

    private final void a(int[] nArray) {
        int n = 0;
        if (this.ab[this.bj][1] - this.ab[this.bj][10] < nArray[1] && this.ab[this.bj][1] > nArray[1] - nArray[3]) {
            this.ad[this.bj][0] = nArray[0];
            this.af[this.bj][2] = 4;
            this.af[this.bj][1] = 1;
            return;
        }
        if (this.af[this.bj][2] == 4) {
            this.af[this.bj][1] = 0;
        }
        if (this.af[this.bj][1] == 0 && this.ab[this.bj][11] == 0) {
            boolean bl = this.ab[this.bj][1] > nArray[1];
            this.af[this.bj][1] = 1;
            int n2 = this.ab[this.bj][0] >> 4;
            int n3 = this.ab[this.bj][1] >> 4;
            int n4 = n2;
            int n5 = n3;
            int n6 = -1;
            int n7 = -1;
            this.aG[0] = nArray[0] - (nArray[2] >> 1);
            this.aG[1] = nArray[1] - nArray[3];
            this.aG[2] = nArray[0] + (nArray[2] >> 1);
            this.aG[3] = nArray[1];
            boolean bl2 = false;
            while (!bl2) {
                ++n;
                if (n2 << 4 < this.aG[2] && (n2 << 4) + 16 > this.aG[0] && (n3 << 4) - 16 < this.aG[3] && n3 << 4 > this.aG[1]) {
                    this.af[this.bj][2] = 4;
                    this.ad[this.bj][0] = nArray[0];
                    return;
                }
                if (n2 > this.bH - 2) {
                    n2 = -1;
                    break;
                }
                if (this.aJ[9][this.cR[n2 + 1][n3]] == -2) {
                    ++n3;
                }
                if (this.aJ[9][this.cR[n2 + 1][n3]] == 2) {
                    --n3;
                }
                if (--n2 < 0 || this.cO[n2][n3] == 0) {
                    n2 = -1;
                    break;
                }
                if (this.cO[n2][n3] == 3) {
                    boolean bl3 = bl2 = !bl2;
                }
                if (!bl || this.cO[n2][n3] != 5 || n6 != -1) continue;
                n6 = n2;
            }
            bl2 = false;
            while (!bl2) {
                ++n;
                if (n4 << 4 < this.aG[2] && (n4 << 4) + 16 > this.aG[0] && (n5 << 4) - 16 < this.aG[3] && n5 << 4 > this.aG[1]) {
                    this.af[this.bj][2] = 4;
                    return;
                }
                if (this.aJ[9][this.cR[n4 - 1][n5]] == 2) {
                    ++n5;
                }
                if (this.aJ[9][this.cR[n4 - 1][n5]] == -2) {
                    --n5;
                }
                if (++n4 > this.bH - 1 || this.cO[n4][n5] == 0) {
                    n4 = -1;
                    break;
                }
                if (this.cO[n4][n5] == 3) {
                    bl2 = !bl2;
                    ++n4;
                }
                if (!bl || this.cO[n4][n5] != 5 || n7 != -1) continue;
                n7 = n4;
            }
            if (bl) {
                if (n6 == -1 && n7 == -1) {
                    this.af[this.bj][2] = 4;
                    this.ad[this.bj][0] = nArray[0];
                    return;
                }
                this.af[this.bj][2] = 5;
                if ((n7 <<= 5) < 0 || e.g(nArray[0]) < e.g(n7 - nArray[0])) {
                    this.ad[this.bj][0] = 0;
                    return;
                }
                this.ad[this.bj][0] = n7;
                return;
            }
            if (n > this.bG) {
                this.bG = n;
            }
            if ((n2 <<= 4) > 0 && e.g(nArray[0] - n2) + e.g(nArray[1] - (n3 <<= 4)) < e.g(nArray[0] - (n4 <<= 4)) + e.g(nArray[1] - (n5 <<= 4))) {
                this.ad[this.bj][0] = n2;
                this.ad[this.bj][1] = n3;
            } else {
                this.ad[this.bj][0] = n4;
                this.ad[this.bj][1] = n5;
            }
            this.af[this.bj][2] = 3;
        }
    }

    final void a() {
        Display.getDisplay((MIDlet)tr.a).setCurrent((Displayable)this);
        this.cI.start();
    }

    public final void hideNotify() {
        super.hideNotify();
    }

    private static byte d(int n) {
        int n2 = n;
        if (n > 127) {
            n2 = n - 256;
        }
        return (byte)n2;
    }

    protected final void KEYPRESSED(int n) {
        if (n == -1) {
            n = 50;
        }
        if (n == -2) {
            n = 56;
        }
        if (n == -3) {
            n = 52;
        }
        if (n == -4) {
            n = 54;
        }
        if (n == -6 || n == -5) {
            n = 53;
        }
        if (n == -7) {
            n = this.an;
        }
        this.bn = n;
        if (n == 42 || n == this.an || n == 48) {
            this.bk = true;
            this.bl = false;
        } else {
            this.bl = true;
            this.bk = false;
        }
        this.bo = false;
        this.bm = n;
    }

    protected final void KEYRELEASED(int n) {
        if (this.bo) {
            this.bm = 0;
            return;
        }
        this.bp = true;
    }

    private void e(int n) {
        if (this.cn == this.I - 1) {
            return;
        }
        int n2 = n << 1;
        this.O[n2] = (byte)(this.O[n2] + this.cn);
        this.cn = (byte)(this.cn + 1);
        if (this.cn == this.I - 1) {
            n = 0;
            while (n < this.I) {
                if (this.ab[n][12] == 1) {
                    int n3 = n << 1;
                    this.O[n3] = (byte)(this.O[n3] + this.cn);
                    break;
                }
                ++n;
            }
            this.cn = 0;
            this.s();
        }
    }

    private final String[] p() {
        String[] stringArray = new String[this.y + 1];
        int n = 0;
        while (n < this.y) {
            stringArray[n] = n + 1 + ". \u0423\u0440\u043e\u0432\u0435\u043d\u044c";
            ++n;
        }
        stringArray[this.y] = "\u041d\u0430\u0437\u0430\u0434";
        return stringArray;
    }

    private final void b(byte by) {
        this.ab[by][24] = this.ab[by][5] * this.ab[by][9] * this.aP[by] >> 16;
        this.ab[by][25] = 65280;
        if (this.ab[by][9] - this.ab[by][24] >= (this.ab[by][9] >> 2) + (this.ab[by][9] >> 1)) {
            this.ab[by][25] = 0xFF0000;
            return;
        }
        if (this.ab[by][9] - this.ab[by][24] >= this.ab[by][9] >> 2) {
            this.ab[by][25] = 0xFFFF00;
        }
    }

    private final void q() {
        this.s = new a();
        String[] stringArray = b.a(b.d.c("text4"), this.s, 10000, false);
        this.Z = new String[stringArray.length];
        int n = 0;
        while (n < stringArray.length) {
            this.Z[n] = new String(stringArray[n]);
            ++n;
        }
        this.bQ = (this.b - (this.b / 10 << 1)) / this.s.a();
        this.co = new int[this.bQ];
        this.cE = new String[this.bQ];
        int n2 = 0;
        while (n2 < this.bQ) {
            this.co[n2] = 0;
            this.cE[n2] = "Net Lizard";
            ++n2;
        }
        this.av = this.e >> 2;
        this.bR = 16;
        this.cs = (byte)8;
        this.bC = this.bJ * this.bK;
        this.bE = this.e / 16;
        this.bF = this.b / 16;
        this.o();
        this.cg = this.bM;
        this.m = (byte)(this.k.getWidth() >> 1);
        this.l = (byte)this.k.getHeight();
        this.bW = new c(this, this.b("text"));
    }

    private final void r() {
        byte[] byArray = b.d.a("ccs", -1);
        int n = byArray.length;
        this.bt = n / 7;
        this.h = new byte[this.bu][this.bt];
        int n2 = 0;
        int n3 = 0;
        while (n3 < this.bt) {
            n = 0;
            while (n < 7) {
                this.h[n][n3] = byArray[n2];
                ++n2;
                ++n;
            }
            if (this.h[0][n3] < 0) {
                byte[] byArray2 = this.h[0];
                int n4 = n3;
                byArray2[n4] = (byte)(byArray2[n4] + 256);
            }
            if (this.h[1][n3] < 0) {
                byte[] byArray3 = this.h[1];
                int n5 = n3;
                byArray3[n5] = (byte)(byArray3[n5] + 256);
            }
            if (this.h[2][n3] < 0) {
                byte[] byArray4 = this.h[2];
                int n6 = n3;
                byArray4[n6] = (byte)(byArray4[n6] + 256);
            }
            if (this.h[3][n3] < 0) {
                byte[] byArray5 = this.h[3];
                int n7 = n3;
                byArray5[n7] = (byte)(byArray5[n7] + 256);
            }
            ++n3;
        }
    }

    final void b() {
        try {
            this.q = b.a("/f1.png");
        }
        catch (Exception exception) {}
        try {
            this.r = b.a("/f2.png");
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    final void a(int n) {
        if (this.B != null) {
            this.B = null;
        }
        try {
            this.B = b.a("/li" + n + ".png");
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    private final void f(int n) {
        int n2;
        block36: {
            try {
                int n3;
                if (this.aB != null) {
                    this.aB = null;
                }
                if (this.aC != null) {
                    this.aC = null;
                }
                if (n != 0 && n != 1) break block36;
                if (e.n == 1) {
                    while (this.cz * this.bS <= this.b) {
                        ++this.bS;
                    }
                    this.aC = new Image[this.bS];
                    n2 = this.cz * this.bS;
                    int n4 = -1;
                    int n5 = 0;
                    Graphics graphics = null;
                    int n6 = 0;
                    while (n6 < n2) {
                        try {
                            n3 = n6 / this.cz;
                            if (n3 != n4) {
                                this.aC[n3] = Image.createImage((int)this.cA, (int)this.cz);
                                graphics = this.aC[n3].getGraphics();
                                n5 = 0;
                                n4 = n3;
                            }
                            n3 = 255 + n6 * -255 / n2;
                            int n7 = 255 + n6 * 0 / n2;
                            int n8 = 255 + n6 * -255 / n2;
                            graphics.setColor(n3, n7, n8);
                            graphics.drawLine(0, n5, this.cA, n5);
                        }
                        catch (Exception exception) {}
                        ++n5;
                        ++n6;
                    }
                }
                if (e.n != 2) break block36;
                this.aD = this.aD == 0 ? 1 : 0;
                try {
                    this.aB = b.a("/bg" + this.aD + ".png");
                }
                catch (Exception exception) {}
                n3 = 0;
                if (this.aB != null) {
                    this.aF = n3 = this.aB.getWidth();
                    this.aE = this.e / n3;
                    break block36;
                }
                this.aD = this.aD == 0 ? 1 : 0;
                try {
                    this.aB = b.a("/bg" + this.aD + ".png");
                }
                catch (Exception exception) {}
                if (this.aB != null) {
                    this.aF = n3 = this.aB.getWidth();
                    this.aE = this.e / n3;
                } else {
                    this.aE = -1;
                    e.n = 0;
                }
            }
            catch (Exception exception) {}
        }
        if (n == 0) {
            this.cc = new Image[(this.bs << 1) - 1];
            n2 = 0;
            while (n2 < this.bs) {
                Image image = null;
                try {
                    this.cc[n2] = b.a("/u" + n2 + ".png");
                }
                catch (Exception exception) {}
                if (n2 < 5) {
                    image = this.cc[n2];
                    this.cc[n2 + this.bs] = e.a(image, 0, 0, image.getWidth(), image.getHeight(), 2);
                }
                ++n2;
            }
        }
        if (e.n == 0) {
            this.aN = this.aN == 0 ? (byte)1 : 0;
            this.ca = new Image[this.bq];
            Image image = null;
            n2 = 0;
            while (n2 < this.ca.length) {
                try {
                    image = b.a("/l" + this.aN + ".png");
                }
                catch (Exception exception) {}
                if (image == null) {
                    this.aN = this.aN == 0 ? (byte)1 : 0;
                    try {
                        image = b.a("/l" + this.aN + ".png");
                    }
                    catch (Exception exception) {}
                }
                this.ca[n2] = Image.createImage((int)image.getWidth(), (int)image.getHeight());
                Graphics graphics = this.ca[n2].getGraphics();
                graphics.setColor(0, this.aY, 0);
                graphics.fillRect(0, 0, image.getWidth(), image.getHeight());
                graphics.drawImage(image, 0, 0, 20);
                image = null;
                ++n2;
            }
        }
        if (e.n >= 1) {
            this.aN = this.aN == 0 ? (byte)1 : 0;
            this.ca = new Image[this.bq];
            int n9 = 0;
            while (n9 < this.ca.length) {
                try {
                    this.ca[n9] = b.a("/l" + this.aN + ".png");
                }
                catch (Exception exception) {}
                if (this.ca[n9] == null) {
                    this.aN = this.aN == 0 ? (byte)1 : 0;
                    try {
                        this.ca[n9] = b.a("/l" + this.aN + ".png");
                    }
                    catch (Exception exception) {}
                }
                ++n9;
            }
        }
    }

    public static final void c() {
        e.a(u, true);
    }

    private static int g(int n) {
        if (n < 0) {
            return -n;
        }
        return n;
    }

    private void s() {
        if (this.as < this.G) {
            ++this.as;
        } else {
            this.c((byte)5);
            return;
        }
        this.cn = 0;
        int n = this.c((int)this.bN);
        int n2 = 0;
        while (n2 < this.I) {
            if (n2 + n > this.bN - 1) {
                this.ab[n2][14] = n2 + n - this.bN;
            }
            this.h(n2);
            ++n2;
        }
        n = 0;
        while (n < this.ay) {
            this.cd[n][5] = 0;
            ++n;
        }
        this.cM = (byte)30;
        this.au = this.H;
        this.cp = 0L;
        this.ct = 0;
        this.cD = 0;
        this.cr = new int[20][11];
        this.cC = new int[25][7];
        this.aq = new short[this.I];
    }

    private final void t() {
        byte by;
        byte by2 = by = (byte)this.ab[this.bj][8];
        while (by2 != (by = (byte)(by + 1))) {
            if (by > 5) {
                by = 0;
            }
            if (this.cw[this.bj][by] != 1) continue;
            this.ab[this.bj][8] = by;
            return;
        }
    }

    public final void paint(Graphics graphics) {
        try {
            if (this.bd) {
                return;
            }
            if (this.aA != -1) {
                graphics.drawImage(this.bz, this.f - (this.bz.getWidth() >> 1), this.c - (this.bz.getHeight() >> 1), 20);
                return;
            }
            if (this.A) {
                int n;
                if (this.z) {
                    graphics.setColor(0);
                    graphics.fillRect(0, 0, this.e, this.b);
                    this.s.a(graphics, this.Z[2], this.f - (this.s.a(this.Z[2]) >> 1), this.s.a() << 1, 20);
                    this.A = false;
                    this.z = false;
                    long l = System.currentTimeMillis();
                    if (V) {
                        e.a(u, true);
                    } else {
                        d.a();
                    }
                    long l2 = System.currentTimeMillis();
                    if (l2 - l < 1000L) {
                        this.cv = 1000L - (l2 - l);
                    }
                    return;
                }
                Graphics graphics2 = graphics;
                e e2 = this;
                if (e2.Q) {
                    graphics2.setColor(0);
                    graphics2.fillRect(0, e2.s.a() << 1, e2.e, e2.s.a());
                    e2.s.a(graphics2, e2.Z[2], e2.f - (e2.s.a(e2.Z[2]) >> 1), e2.s.a() << 1, 20);
                    return;
                }
                graphics2.setClip(0, 0, e2.e, e2.b);
                graphics2.setColor(0);
                graphics2.fillRect(0, e2.b - (e2.w.getHeight() >> 1), e2.e, e2.w.getHeight() >> 2);
                if (e2.B != null) {
                    graphics2.setColor(0);
                    graphics2.fillRect(0, 0, e2.e, e2.b);
                    graphics2.setColor(0xFFFFFF);
                    graphics2.drawImage(e2.B, (e2.e >> 1) - (e2.B.getWidth() >> 1), (e2.b - (e2.w.getHeight() - (e2.w.getHeight() >> 2)) >> 1) - (e2.B.getHeight() >> 1), 20);
                    e2.B = null;
                }
                int n2 = e2.aa * e2.w.getWidth() - e2.w.getWidth();
                if (e2.C == -1) {
                    n2 = e2.bT * e2.w.getWidth() - e2.w.getWidth();
                    if (e2.aa == e2.bT) {
                        e2.aa = 0;
                        graphics2.setColor(0x880000);
                    } else {
                        e2.aa = e2.bT;
                        graphics2.setColor(0xFF0000);
                    }
                    n = e2.bT;
                } else {
                    n = e2.C;
                    graphics2.setColor(0xFF0000);
                }
                graphics2.fillRect(0, e2.b - (e2.w.getHeight() >> 1), n2, e2.w.getHeight() >> 2);
                n2 = 0;
                n2 = e2.b - (e2.w.getHeight() >> 2);
                graphics2.setClip(0, n2, e2.e, e2.w.getHeight() >> 2);
                n2 -= e2.w.getHeight() - (e2.w.getHeight() >> 2);
                int n3 = 0;
                while (n3 < n) {
                    if (n3 < e2.aa) {
                        graphics2.drawImage(e2.w, n3 * e2.w.getWidth(), n2 + (e2.w.getHeight() >> 1), 20);
                    } else {
                        graphics2.drawImage(e2.w, n3 * e2.w.getWidth(), n2, 20);
                    }
                    ++n3;
                }
                n2 = e2.b - (e2.w.getHeight() - (e2.w.getHeight() >> 2));
                graphics2.setClip(0, n2, e2.e, e2.w.getHeight() >> 2);
                n2 -= e2.w.getHeight() >> 1;
                n3 = 0;
                while (n3 < n) {
                    if (n3 < e2.aa) {
                        graphics2.drawImage(e2.w, n3 * e2.w.getWidth(), n2 + (e2.w.getHeight() >> 1), 20);
                    } else {
                        graphics2.drawImage(e2.w, n3 * e2.w.getWidth(), n2, 20);
                    }
                    ++n3;
                }
                n2 = e2.C == -1 ? 3 : 5;
                graphics2.setColor(0);
                n = e2.s.a(e2.Z[n2]);
                graphics2.setClip(0, 0, e2.e, e2.b);
                graphics2.fillRect(0, e2.b - e2.w.getHeight() - e2.s.a(), e2.e, e2.s.a());
                e2.s.a(graphics2, e2.Z[n2], e2.f - (n >> 1), e2.b - e2.w.getHeight() - e2.s.a(), 20);
                if (e2.C == -1) {
                    e2.s.a(graphics2, "100%", e2.f - (e2.s.a("100%") >> 1), e2.b - (e2.w.getHeight() >> 1) + (e2.w.getHeight() >> 3) - (e2.s.a() >> 1), 20);
                    return;
                }
                n = e2.aa * 100 / 9;
                if (n > 100) {
                    n = 100;
                }
                e2.s.a(graphics2, n + "%", e2.f - (e2.s.a(n + "%") >> 1), e2.b - (e2.w.getHeight() >> 1) + (e2.w.getHeight() >> 3) - (e2.s.a() >> 1), 20);
                return;
            }
            if (J) {
                if (this.K == 1) {
                    Graphics graphics3 = graphics;
                    e e3 = this;
                    e3.a(graphics3, e3.cf, e3.cg);
                    e3.a(graphics3);
                    e3.d(graphics3);
                    e3.b(graphics3);
                    e3.c(graphics3);
                    graphics3.setClip(0, 0, e3.e, e3.b);
                    e.a(graphics, 0, 0, this.e, this.b, 0, 100);
                }
                this.bW.a(graphics, this.K);
                return;
            }
            this.a(graphics, this.cf, this.cg);
            this.a(graphics);
            this.d(graphics);
            this.b(graphics);
            this.c(graphics);
            if (this.bi) {
                Graphics graphics4 = graphics;
                e e4 = this;
                e4.a(graphics4, 18, 0, 0);
                e4.a(graphics4, e4.h[2][18] - 1, 0, 2967296, 1516544, 3, false);
                e4.a(graphics4, e4.f + e4.h[2][17] - 1, e4.b - e4.bf - 6, 2967296, 1516544, 3, false);
                e4.a(graphics4, e4.f - e4.h[2][17], e4.b - e4.bf - 6, 2967296, 1516544, 3, true);
                e4.a(graphics4, 17, e4.f - e4.h[2][17], e4.b - e4.h[3][17]);
                e4.a(graphics4, 21 + e4.ab[e4.bj][8], e4.f, e4.b - e4.h[3][17]);
                e4.cl = "";
                e4.cl = "" + e4.ab[e4.bj][6];
                if (e4.bA[3] == 0 || e4.aV == 1) {
                    e4.a(graphics4, e4.cl, e4.h[2][18] + (e4.h[2][12] >> 1) - (e4.cl.length() * (e4.h[2][2] + 1) >> 1), (e4.h[3][12] >> 1) - (e4.h[3][1] >> 1));
                }
                e4.cl = "" + e4.ab[e4.bj][5];
                if (e4.bA[2] == 0 || e4.aV == 1) {
                    e4.a(graphics4, e4.cl, e4.f - e4.h[2][17] - (e4.h[2][12] >> 1) - (e4.cl.length() * (e4.h[2][2] + 1) >> 1), e4.b - (e4.h[3][12] >> 1) - (e4.h[3][1] >> 1) - 1);
                }
                e4.cl = "" + e4.cx[e4.bj][e4.ab[e4.bj][8]];
                e4.a(graphics4, e4.cl, e4.f + e4.h[2][21] + (e4.h[2][12] >> 1) - (e4.cl.length() * (e4.h[2][2] + 1) >> 1), e4.b - (e4.h[3][12] >> 1) - (e4.h[3][1] >> 1) - 1);
                if (e4.aq[e4.bj] > 0) {
                    e4.b(graphics4, 76, e4.f - (e4.aO[76][2] >> 1), e4.s.a());
                }
                if (e4.t == 3) {
                    e4.a(graphics4, e4.e, 0, 0xFF0000, 0x9E0000, 2, true);
                    e4.a(graphics4, e4.e, 0, 34047, 3967, -2, true);
                    e4.cl = "" + e4.cm[1];
                    if (e4.bA[1] == 0 || e4.aV == 1) {
                        e4.a(graphics4, e4.cl, e4.e - (e4.h[2][12] >> 1) + (e4.cl.length() * e4.h[2][2] >> 1), (e4.h[3][12] >> 1) - (e4.h[3][1] >> 1));
                    }
                    e4.cl = "" + e4.cm[0];
                    if (e4.bA[0] == 0 || e4.aV == 1) {
                        e4.a(graphics4, e4.cl, e4.e - e4.h[2][12] - (e4.cl.length() * e4.h[2][2] >> 1), (e4.h[3][12] >> 1) - (e4.h[3][1] >> 1));
                    }
                }
                e4.cl = e4.au + ":" + (e4.cp < 10000L ? "0" : "") + e4.cp / 1000L;
                e4.s.a(graphics4, e4.cl, e4.f - (e4.s.a(e4.cl) >> 1), 0, 20);
            }
            if (this.aK) {
                this.s.a(graphics, this.cG + "", 0, this.c, 20);
                this.s.a(graphics, this.cH + "", 0, this.c + this.s.a(), 20);
                this.s.a(graphics, this.ct + "", 0, this.c + (this.s.a() << 1), 20);
            }
            if (this.t == 3 && this.aV > 0) {
                if (this.aU[0][2] != -1) {
                    this.b(graphics, this.ao + this.aV, this.e - (this.h[2][13] << 1) + (this.h[2][13] >> 1) - (this.aO[100][2] >> 1), this.h[3][13] + 2);
                }
                if (this.aU[1][2] != -1) {
                    this.b(graphics, this.ao + this.aV - 4, this.e - this.h[2][13] + (this.h[2][13] >> 1) - (this.aO[100][2] >> 1), this.h[3][13] + 2);
                }
            }
            if (this.cM > 0) {
                graphics.setColor(0xFF0000);
                graphics.fillRect(0, this.h[3][12] + (this.s.a() >> 1), this.e, this.s.a());
                this.s.a(graphics, this.Z[4] + this.as, this.f - (this.s.a(this.Z[4] + this.as) >> 1), this.h[3][12] + (this.s.a() >> 1), 20);
            }
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    private void u() {
        int n = 0;
        while (n < this.I) {
            if (this.ab[n][12] == 1) {
                int n2 = n << 1;
                this.O[n2] = (byte)(this.O[n2] + this.cn);
                this.cn = (byte)(this.cn + 1);
            }
            ++n;
        }
    }

    private final void h(int n) {
        this.aQ[n] = 0;
        this.af[n][0] = 0;
        this.az[n][0] = -1;
        this.ab[n][27] = 99;
        byte by = 0;
        while (by < this.bD) {
            this.cw[n][by] = 0;
            this.cx[n][by] = 0;
            if (by == 0) {
                this.cw[n][by] = 1;
                this.cx[n][by] = 1;
            } else if (by == 1) {
                this.cw[n][by] = 1;
                this.cx[n][by] = 100;
            } else if (n == this.Y && this.aK) {
                if (by == 2) {
                    this.cw[n][by] = 1;
                    this.cx[n][by] = 100;
                } else if (by == 3) {
                    this.cw[n][by] = 1;
                    this.cx[n][by] = 10;
                } else if (by == 4) {
                    this.cw[n][by] = 1;
                    this.cx[n][by] = 15;
                } else if (by == 5) {
                    this.cw[n][by] = 1;
                    this.cx[n][by] = 10;
                }
            }
            by = (byte)(by + 1);
        }
        this.ab[n][8] = 1;
        int[] nArray = this.ab[n];
        nArray[14] = nArray[14] + 1;
        if (this.t == 1 || this.t == 3) {
            if (this.cu[n] == 0) {
                if (this.bP - 1 < this.ab[n][14]) {
                    this.ab[n][14] = 0;
                }
                this.ab[n][0] = this.cj[this.ab[n][14] << 1] << 4;
                this.ab[n][1] = this.cj[(this.ab[n][14] << 1) + 1] << 4;
            }
            if (this.cu[n] == 1) {
                if (this.bO - 1 < this.ab[n][14]) {
                    this.ab[n][14] = 0;
                }
                this.ab[n][0] = this.ci[this.ab[n][14] << 1] << 4;
                this.ab[n][1] = this.ci[(this.ab[n][14] << 1) + 1] << 4;
            }
        } else {
            if (this.bN - 1 < this.ab[n][14]) {
                this.ab[n][14] = 0;
            }
            this.ab[n][0] = this.ck[this.ab[n][14] << 1] << 4;
            this.ab[n][1] = this.ck[(this.ab[n][14] << 1) + 1] << 4;
        }
        this.ab[n][25] = 65280;
        this.ab[n][5] = this.ab[n][23];
        this.ab[n][6] = 0;
        this.ab[n][24] = this.ab[n][5] * this.ab[n][9] * this.aP[n] >> 16;
        this.ab[n][12] = 1;
        this.ab[n][21] = 0;
        if (this.Y == n) {
            this.cf = this.ab[this.Y][0] - this.av;
            this.cg = this.ab[this.Y][1] - (this.b - this.ab[this.Y][10]);
        }
        this.a(this.ab[n][0], this.ab[n][1] + this.bh, this.ab[n][20] > 0 ? (byte)8 : 9);
    }

    public final void d() {
        int n;
        this.bj = 0;
        this.ct = 0;
        this.cD = 0;
        this.cp = 0L;
        this.au = this.H;
        this.aq = new short[this.I];
        this.aQ = new byte[this.I];
        this.cC = new int[25][7];
        this.cr = new int[20][11];
        this.aM = new byte[this.I];
        this.cJ = new byte[this.I];
        this.O = new byte[this.I << 1];
        this.cx = new short[this.I][this.bD];
        this.ch = new byte[this.I];
        this.cw = new byte[this.I][this.bD];
        this.af = new short[this.I][4];
        this.cq = new byte[this.I];
        this.U = new byte[this.I];
        this.bg = (byte)(this.ab[0][9] >> 1);
        this.bh = (byte)(this.ab[0][10] >> 1);
        this.cM = 0;
        this.as = 0;
        this.Y = this.L ? (byte)0 : (byte)(this.I - 1);
        this.cm[0] = 0;
        this.cm[1] = 0;
        int n2 = 0;
        int n3 = 0;
        if (this.t == 3 || this.t == 1) {
            this.bP = (byte)(this.cj.length >> 1);
            this.bO = (byte)(this.ci.length >> 1);
            n2 = this.c((int)this.bP);
            n3 = this.c((int)this.bO);
            n = 0;
            while (n < this.I) {
                this.U[n] = (byte)n;
                this.af[n][0] = 0;
                this.af[n][3] = 1;
                if (this.cu[n] == 0) {
                    this.ab[n][14] = n + n2 > this.bP - 1 ? n + n2 - this.bP : n + n2;
                }
                if (this.cu[n] == 1) {
                    this.ab[n][14] = n + n3 > this.bO - 1 ? n + n3 - this.bO : n + n3;
                }
                ++n;
            }
        } else {
            this.bN = (byte)(this.ck.length >> 1);
            n2 = this.c((int)this.bN);
            n = 0;
            while (n < this.I) {
                this.U[n] = (byte)n;
                this.af[n][0] = 0;
                this.af[n][3] = 1;
                this.ab[n][14] = n + n2 > this.bN - 1 ? n + n2 - this.bN : n + n2;
                ++n;
            }
        }
        this.ad = new int[this.I][2];
        this.az = new byte[this.I][2];
        n = 0;
        while (n < this.I) {
            this.az[n][0] = -1;
            this.az[n][1] = -1;
            ++n;
        }
        this.cU = new short[this.I << 1];
        this.aT = new byte[this.I];
        this.aS = new byte[this.I];
        this.bj = 0;
        while (this.bj < this.I) {
            this.h(this.bj);
            ++this.bj;
        }
        n2 = 0;
        while (n2 < this.ay) {
            this.cd[n2][5] = 0;
            ++n2;
        }
        this.aU[0][0] = this.aW[0][0] + (this.aO[this.ao - 1][2] >> 1) - 2;
        this.aU[0][1] = this.aW[0][1] - this.aO[98][3] + (this.aO[this.ao - 1][3] >> 1);
        this.aU[1][0] = this.aW[1][0] + (this.aO[this.ao - 1][2] >> 1) - 2;
        this.aU[1][1] = this.aW[1][1] - this.aO[98][3] + (this.aO[this.ao - 1][3] >> 1);
        this.bf = this.h[3][1];
        this.cN = this.h[2][1];
        this.ar = this.aO[39][2] + this.aO[39][3];
        if (this.t == 4) {
            this.s();
        }
        this.cf = this.ab[this.Y][0] - this.av;
        this.cg = this.ab[this.Y][1] - (this.b - this.ab[this.Y][10]);
    }

    private final void c(byte by) {
        if (by == 1) {
            J = !J;
            this.d = !this.d;
            e e2 = this;
            int n = e2.O.length >> 1;
            int[] nArray = new int[n];
            int n2 = 0;
            while (n2 < n) {
                nArray[n2] = e2.O[(n2 << 1) + 1];
                e2.U[n2] = (byte)n2;
                ++n2;
            }
            n2 = 1;
            while (n2 < n) {
                int n3 = nArray[n2];
                byte by2 = e2.U[n2];
                int n4 = n2;
                while (n4 > 0 && nArray[n4 - 1] > n3) {
                    nArray[n4] = nArray[n4 - 1];
                    e2.U[n4] = e2.U[n4 - 1];
                    --n4;
                }
                nArray[n4] = n3;
                e2.U[n4] = by2;
                ++n2;
            }
            this.K = (byte)22;
            return;
        }
        J = !J;
        this.d = !this.d;
        this.e();
        this.K = (byte)22;
    }

    final void a(Graphics graphics, int n, int n2, int n3) {
        graphics.setClip(n2, n3, (int)this.h[2][n], (int)this.h[3][n]);
        graphics.drawImage(this.cb[this.h[this.bv - 1][n]], n2 - this.h[0][n], n3 - this.h[1][n], 20);
        graphics.setClip(0, 0, this.e, this.b);
    }

    private final void a(Graphics graphics, int n, int n2, int n3, byte by) {
        if (this.aO[n][4] != 0) {
            n2 = by == 1 ? (n2 += this.aO[n][4]) : (n2 += this.aO[n][4] * by - this.aO[n][2]);
        }
        graphics.setClip(n2, n3 += this.aO[n][5], (int)this.aO[n][2], (int)this.aO[n][3]);
        if (by == -1) {
            graphics.drawImage(this.cc[this.aO[n][this.bx - 1] + this.bs], n2 - this.cc[this.aO[n][this.bx - 1]].getWidth() + this.aO[n][2] + this.aO[n][0], n3 - this.aO[n][1], 20);
            return;
        }
        graphics.drawImage(this.cc[this.aO[n][this.bx - 1]], n2 - this.aO[n][0], n3 - this.aO[n][1], 20);
    }

    private final void b(Graphics graphics, int n, int n2, int n3) {
        graphics.setClip(n2 += this.aO[n][4], n3 += this.aO[n][5], (int)this.aO[n][2], (int)this.aO[n][3]);
        graphics.drawImage(this.cc[this.aO[n][this.bx - 1]], n2 - this.aO[n][0], n3 - this.aO[n][1], 20);
    }

    static final byte[] b(int n) {
        if (n < 0) {
            n += 65536;
        }
        byte[] byArray = new byte[2];
        int n2 = n / 256;
        byArray[0] = e.d(n2);
        byArray[1] = e.d(n -= n2 * 256);
        return byArray;
    }

    static final int a(byte by, byte by2) {
        int n = 256 * e.a(by) + e.a(by2);
        by = (byte)n;
        if (n > Short.MAX_VALUE) {
            by = (byte)(by - 65536);
        }
        return by;
    }

    /*
     * Unable to fully structure code
     */
    public final void run() {
        block300: {
            this.bd = false;
            var3_1 = this;
            try {
                var3_1.bz = null;
                var11_8 = true;
                var12_13 = "lz";
                while (var11_8) {
                    try {
                        var13_24 = b.d.a(var12_13, 3);
                        var2_15 = var13_24[1];
                        var14_29 = var13_24[0];
                        var13_24 = b.d.a(var12_13, 3 + (256 * e.a((byte)var14_29) + e.a(var2_15)), var13_24[2] - 3);
                        var3_1.bz = Image.createImage((byte[])var13_24, (int)3, (int)(var13_24.length - 3));
                        var11_8 = false;
                    }
                    catch (Exception v0) {
                        if (var12_13.length() >= 3) continue;
                        var12_13 = var12_13 + "a";
                    }
                }
                var3_1.aA = 0xFFFFFF;
                var3_1.l();
                Thread.sleep(2500L);
            }
            catch (Exception v1) {
                var3_1.j = false;
                break block300;
            }
            try {
                var3_1.bz = null;
                var11_8 = true;
                var12_13 = "/or.png";
                while (var11_8) {
                    try {
                        var3_1.bz = Image.createImage((String)var12_13);
                        var11_8 = false;
                    }
                    catch (Exception v2) {
                        var11_8 = false;
                    }
                }
                var3_1.aA = 0xFFFFFF;
                var3_1.l();
                Thread.sleep(2500L);
            }
            catch (Exception v3) {}
            var3_1.bz = null;
            var3_1.aA = -1;
        }
        b.b = true;
        b.a();
        e.ac = true;
        if (b.a[2] < 1) {
            e.ac = false;
        }
        e.n = b.a[5];
        this.q();
        var1_30 = 0;
        var2_15 = 0;
        ** GOTO lbl988
        {
            block302: {
                block303: {
                    block305: {
                        block310: {
                            block311: {
                                block308: {
                                    block309: {
                                        block307: {
                                            block306: {
                                                block304: {
                                                    try {
                                                        Thread.sleep(this.cv + 7L);
                                                    }
                                                    catch (Exception v4) {}
                                                    this.cv = 0L;
                                                    var2_16 = 0;
                                                    if (this.bm == 0) break block302;
                                                    if (!this.bk && !this.bl) break block303;
                                                    var11_9 = var3_2 = this;
                                                    var3_2.bo = true;
                                                    if (var11_9.K == 12) {
                                                        if (var11_9.i.length() > 15) {
                                                            var11_9.i = "";
                                                        }
                                                        if (var11_9.bn == 35) {
                                                            var11_9.i = var11_9.i + '#';
                                                        }
                                                        if (var11_9.bn == 56) {
                                                            var11_9.i = var11_9.i + '8';
                                                        }
                                                        if (var11_9.bn == 53) {
                                                            var11_9.i = var11_9.i + '5';
                                                        }
                                                        if (var11_9.i.length() == 3 && var11_9.i.charAt(0) == '#' && var11_9.i.charAt(1) == '8' && var11_9.i.charAt(2) == '5') {
                                                            var11_9.aK = true;
                                                        }
                                                    }
                                                    var12_14 = 0;
                                                    var13_26 = false;
                                                    var14_29 = 0;
                                                    var2_16 = 0;
                                                    var4_31 = 0;
                                                    switch (var11_9.bm) {
                                                        case 49: {
                                                            break;
                                                        }
                                                        case 50: {
                                                            var14_29 = 1;
                                                            break;
                                                        }
                                                        case 52: {
                                                            var12_14 = 1;
                                                            break;
                                                        }
                                                        case 53: {
                                                            var4_31 = 1;
                                                            break;
                                                        }
                                                        case 54: {
                                                            var13_26 = true;
                                                            break;
                                                        }
                                                        case 56: {
                                                            var2_16 = 1;
                                                        }
                                                    }
                                                    if (!var11_9.A) break block304;
                                                    if (!var11_9.Q && var11_9.C == -1) {
                                                        var11_9.aa = 0;
                                                        var11_9.C = 0;
                                                        var11_9.A = false;
                                                        v5 = var11_9.d = var11_9.d == false;
                                                        if (var11_9.S) {
                                                            var11_9.d();
                                                        } else {
                                                            var11_9.S = true;
                                                        }
                                                    }
                                                    break block305;
                                                }
                                                if (var11_9.bm != 35 || var11_9.K != 1 || var11_9.d) break block306;
                                                e.J = e.J == false;
                                                var11_9.d = var11_9.d == false;
                                                break block305;
                                            }
                                            if (var11_9.bm == 42 && var11_9.aK && !e.J) {
                                                v6 = var11_9.d = var11_9.d == false;
                                            }
                                            if (var11_9.bm == 48 && !e.J) {
                                                var11_9.t();
                                            }
                                            if (e.J) break block307;
                                            if (!var11_9.d) {
                                                if (var11_9.ab[var11_9.bj][12] == 1) {
                                                    if (var14_29 != 0) {
                                                        var11_9.g();
                                                    }
                                                    if (var2_16 != 0) {
                                                        var11_9.aI = true;
                                                        if (var11_9.ab[var11_9.Y][11] == 0) {
                                                            var11_9.az[0][0] = 3;
                                                            var11_9.az[0][1] = -1;
                                                        }
                                                    }
                                                    if (var12_14 != 0) {
                                                        var11_9.h();
                                                    }
                                                    if (var13_26) {
                                                        var11_9.k();
                                                    }
                                                    if (var4_31 != 0) {
                                                        var11_9.cq[var11_9.bj] = 1;
                                                    }
                                                } else if (var11_9.t == 4 && var4_31 != 0) {
                                                    var11_9.u();
                                                    var11_9.s();
                                                }
                                            } else {
                                                if (var14_29 != 0) {
                                                    var11_9.cg -= 10;
                                                    if (var11_9.cg < 0) {
                                                        var11_9.cg = 0;
                                                    }
                                                }
                                                if (var2_16 != 0) {
                                                    var11_9.cg += 10;
                                                    if (var11_9.cg > var11_9.bM) {
                                                        var11_9.cg = var11_9.bM;
                                                    }
                                                }
                                                if (var12_14 != 0) {
                                                    var11_9.cf -= 10;
                                                    if (var11_9.cf < 0) {
                                                        var11_9.cf = 0;
                                                    }
                                                }
                                                if (var13_26) {
                                                    var11_9.cf += 10;
                                                    if (var11_9.cf > var11_9.bL) {
                                                        var11_9.cf = var11_9.bL;
                                                    }
                                                }
                                                if (var4_31 != 0) {
                                                    var11_9.d = var11_9.d == false;
                                                }
                                            }
                                            break block305;
                                        }
                                        if (var14_29 != 0) {
                                            var11_9.bW.b();
                                        }
                                        if (var2_16 != 0) {
                                            var11_9.bW.a();
                                        }
                                        if (var12_14 == 0) break block308;
                                        v7 = var11_9.bW;
                                        var5_35 = v7;
                                        if (v7.d) break block308;
                                        if (var5_35.b.K != 4 && var5_35.b.K != 19) break block309;
                                        var5_35.b();
                                        break block308;
                                    }
                                    block15 : switch (var5_35.b.K) {
                                        case 6: {
                                            var5_35.c = (byte)2;
                                            switch (var5_35.a) {
                                                case 0: {
                                                    if (var5_35.b.F <= 0) break;
                                                    var5_35.b.F -= 5;
                                                    break;
                                                }
                                                case 1: {
                                                    if (var5_35.b.H <= 0) break;
                                                    var5_35.b.H -= 5;
                                                    break;
                                                }
                                                case 2: {
                                                    if (var5_35.b.I > 2) {
                                                        var5_35.b.I = (byte)(var5_35.b.I - 2);
                                                    }
                                                    var5_35.b.g[0] = var5_35.b.I >> 1;
                                                    var5_35.b.g[1] = var5_35.b.I >> 1;
                                                    break;
                                                }
                                                case 3: {
                                                    if (var5_35.b.g[1] <= 1) break;
                                                    var5_35.b.g[0] = var5_35.b.g[0] + 1;
                                                    var5_35.b.g[1] = var5_35.b.g[1] - 1;
                                                }
                                            }
                                            break;
                                        }
                                        case 7: {
                                            var5_35.c = (byte)2;
                                            switch (var5_35.a) {
                                                case 0: {
                                                    if (var5_35.b.F <= 0) break;
                                                    var5_35.b.F -= 5;
                                                    break;
                                                }
                                                case 1: {
                                                    if (var5_35.b.H <= 0) break;
                                                    var5_35.b.H -= 5;
                                                    break;
                                                }
                                                case 2: {
                                                    if (var5_35.b.I > 2) {
                                                        var5_35.b.I = (byte)(var5_35.b.I - 2);
                                                    }
                                                    var5_35.b.g[0] = var5_35.b.I >> 1;
                                                    var5_35.b.g[1] = var5_35.b.I >> 1;
                                                    break;
                                                }
                                                case 3: {
                                                    if (var5_35.b.g[1] <= 1) break;
                                                    var5_35.b.g[0] = var5_35.b.g[0] + 1;
                                                    var5_35.b.g[1] = var5_35.b.g[1] - 1;
                                                }
                                            }
                                            break;
                                        }
                                        case 8: {
                                            var5_35.c = (byte)2;
                                            switch (var5_35.a) {
                                                case 0: {
                                                    if (var5_35.b.D <= 0) break;
                                                    var5_35.b.D -= 5;
                                                    break;
                                                }
                                                case 1: {
                                                    if (var5_35.b.H <= 0) break;
                                                    var5_35.b.H -= 5;
                                                    break;
                                                }
                                                case 2: {
                                                    if (var5_35.b.I > 2) {
                                                        var5_35.b.I = (byte)(var5_35.b.I - 2);
                                                    }
                                                    var5_35.b.g[0] = var5_35.b.I >> 1;
                                                    var5_35.b.g[1] = var5_35.b.I >> 1;
                                                    break;
                                                }
                                                case 3: {
                                                    if (var5_35.b.g[1] <= 1) break;
                                                    var5_35.b.g[0] = var5_35.b.g[0] + 1;
                                                    var5_35.b.g[1] = var5_35.b.g[1] - 1;
                                                }
                                            }
                                            break;
                                        }
                                        case 9: {
                                            var5_35.c = (byte)2;
                                            switch (var5_35.a) {
                                                case 0: {
                                                    if (var5_35.b.E <= 0) break;
                                                    var5_35.b.E -= 5;
                                                    break;
                                                }
                                                case 1: {
                                                    if (var5_35.b.H <= 0) break;
                                                    var5_35.b.H -= 5;
                                                    break;
                                                }
                                                case 2: {
                                                    if (var5_35.b.I > 2) {
                                                        var5_35.b.I = (byte)(var5_35.b.I - 2);
                                                    }
                                                    var5_35.b.g[0] = var5_35.b.I >> 1;
                                                    var5_35.b.g[1] = var5_35.b.I >> 1;
                                                    break;
                                                }
                                                case 3: {
                                                    if (var5_35.b.g[1] <= 1) break;
                                                    var5_35.b.g[0] = var5_35.b.g[0] + 1;
                                                    var5_35.b.g[1] = var5_35.b.g[1] - 1;
                                                }
                                            }
                                            break;
                                        }
                                        case 10: {
                                            var5_35.c = (byte)2;
                                            switch (var5_35.a) {
                                                case 0: {
                                                    if (var5_35.b.G > 0) {
                                                        var5_35.b.G -= 5;
                                                        break block15;
                                                    }
                                                    break block308;
                                                }
                                                case 1: {
                                                    if (var5_35.b.H > 0) {
                                                        var5_35.b.H -= 5;
                                                        break block15;
                                                    }
                                                    break block308;
                                                }
                                                case 2: {
                                                    if (var5_35.b.I > 2) {
                                                        var5_35.b.I = (byte)(var5_35.b.I - 2);
                                                    }
                                                    var5_35.b.g[0] = var5_35.b.I >> 1;
                                                    var5_35.b.g[1] = var5_35.b.I >> 1;
                                                    break block15;
                                                }
                                                case 3: {
                                                    if (var5_35.b.g[1] > 1) {
                                                        var5_35.b.g[0] = var5_35.b.g[0] + 1;
                                                        var5_35.b.g[1] = var5_35.b.g[1] - 1;
                                                    } else {
                                                        ** GOTO lbl290
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (!var13_26) break block310;
                                v8 = var11_9.bW;
                                var5_35 = v8;
                                if (v8.d) break block310;
                                if (var5_35.b.K != 4 && var5_35.b.K != 19) break block311;
                                var5_35.a();
                                break block310;
                            }
                            block52 : switch (var5_35.b.K) {
                                case 6: {
                                    var5_35.c = 1;
                                    switch (var5_35.a) {
                                        case 0: {
                                            if (var5_35.b.F >= 100) break;
                                            var5_35.b.F += 5;
                                            break;
                                        }
                                        case 1: {
                                            if (var5_35.b.H >= 100) break;
                                            var5_35.b.H += 5;
                                            break;
                                        }
                                        case 2: {
                                            if (var5_35.b.I < 20) {
                                                var5_35.b.I = (byte)(var5_35.b.I + 2);
                                            }
                                            var5_35.b.g[0] = var5_35.b.I >> 1;
                                            var5_35.b.g[1] = var5_35.b.I >> 1;
                                            break;
                                        }
                                        case 3: {
                                            if (var5_35.b.g[0] <= 1) break;
                                            var5_35.b.g[1] = var5_35.b.g[1] + 1;
                                            var5_35.b.g[0] = var5_35.b.g[0] - 1;
                                        }
                                    }
                                    break;
                                }
                                case 7: {
                                    var5_35.c = 1;
                                    switch (var5_35.a) {
                                        case 0: {
                                            if (var5_35.b.F >= 100) break;
                                            var5_35.b.F += 5;
                                            break;
                                        }
                                        case 1: {
                                            if (var5_35.b.H >= 100) break;
                                            var5_35.b.H += 5;
                                            break;
                                        }
                                        case 2: {
                                            if (var5_35.b.I < 20) {
                                                var5_35.b.I = (byte)(var5_35.b.I + 2);
                                            }
                                            var5_35.b.g[0] = var5_35.b.I >> 1;
                                            var5_35.b.g[1] = var5_35.b.I >> 1;
                                            break;
                                        }
                                        case 3: {
                                            if (var5_35.b.g[0] <= 1) break;
                                            var5_35.b.g[1] = var5_35.b.g[1] + 1;
                                            var5_35.b.g[0] = var5_35.b.g[0] - 1;
                                        }
                                    }
                                    break;
                                }
                                case 8: {
                                    var5_35.c = 1;
                                    switch (var5_35.a) {
                                        case 0: {
                                            if (var5_35.b.D >= 100) break;
                                            var5_35.b.D += 5;
                                            break;
                                        }
                                        case 1: {
                                            if (var5_35.b.H >= 100) break;
                                            var5_35.b.H += 5;
                                            break;
                                        }
                                        case 2: {
                                            if (var5_35.b.I < 20) {
                                                var5_35.b.I = (byte)(var5_35.b.I + 2);
                                            }
                                            var5_35.b.g[0] = var5_35.b.I >> 1;
                                            var5_35.b.g[1] = var5_35.b.I >> 1;
                                            break;
                                        }
                                        case 3: {
                                            if (var5_35.b.g[0] <= 1) break;
                                            var5_35.b.g[1] = var5_35.b.g[1] + 1;
                                            var5_35.b.g[0] = var5_35.b.g[0] - 1;
                                        }
                                    }
                                    break;
                                }
                                case 9: {
                                    var5_35.c = 1;
                                    switch (var5_35.a) {
                                        case 0: {
                                            if (var5_35.b.E >= 100) break;
                                            var5_35.b.E += 5;
                                            break;
                                        }
                                        case 1: {
                                            if (var5_35.b.H >= 100) break;
                                            var5_35.b.H += 5;
                                            break;
                                        }
                                        case 2: {
                                            if (var5_35.b.I < 20) {
                                                var5_35.b.I = (byte)(var5_35.b.I + 2);
                                            }
                                            var5_35.b.g[0] = var5_35.b.I >> 1;
                                            var5_35.b.g[1] = var5_35.b.I >> 1;
                                            break;
                                        }
                                        case 3: {
                                            if (var5_35.b.g[0] <= 1) break;
                                            var5_35.b.g[1] = var5_35.b.g[1] + 1;
                                            var5_35.b.g[0] = var5_35.b.g[0] - 1;
                                        }
                                    }
                                    break;
                                }
                                case 10: {
                                    var5_35.c = 1;
                                    switch (var5_35.a) {
                                        case 0: {
                                            if (var5_35.b.G < 100) {
                                                var5_35.b.G += 5;
                                                break block52;
                                            }
                                            break block310;
                                        }
                                        case 1: {
                                            if (var5_35.b.H < 100) {
                                                var5_35.b.H += 5;
                                                break block52;
                                            }
                                            break block310;
                                        }
                                        case 2: {
                                            if (var5_35.b.I < 20) {
                                                var5_35.b.I = (byte)(var5_35.b.I + 2);
                                            }
                                            var5_35.b.g[0] = var5_35.b.I >> 1;
                                            var5_35.b.g[1] = var5_35.b.I >> 1;
                                            break block52;
                                        }
                                        case 3: {
                                            if (var5_35.b.g[0] > 1) {
                                                var5_35.b.g[1] = var5_35.b.g[1] + 1;
                                                var5_35.b.g[0] = var5_35.b.g[0] - 1;
                                            } else {
                                                ** GOTO lbl415
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (var4_31 != 0) {
                            var11_9.bW.b(false);
                        }
                        if (var11_9.bm == 35) {
                            var11_9.bW.a(false);
                        }
                    }
                    if (var3_2.bp) {
                        var3_2.bm = 0;
                        var3_2.bp = false;
                    }
                    this.bk = false;
                }
                var2_16 = 1;
            }
            if (this.A) {
                var3_3 = this;
                if (var3_3.Q) {
                    if (var3_3.aL) {
                        var11_10 = System.currentTimeMillis();
                        var2_17 = var3_3;
                        var3_3.cR = null;
                        var2_17.bX = null;
                        var2_17.aH = null;
                        var2_17.aO = null;
                        var2_17.aJ = null;
                        var2_17.cO = null;
                        var2_17.cP = null;
                        var2_17.ab = null;
                        var2_17.aq = null;
                        var2_17.aQ = null;
                        var2_17.cC = null;
                        var2_17.cr = null;
                        var2_17.aM = null;
                        var2_17.cJ = null;
                        var2_17.O = null;
                        var2_17.cx = null;
                        var2_17.ch = null;
                        var2_17.cw = null;
                        var2_17.af = null;
                        var2_17.cq = null;
                        var2_17.U = null;
                        var2_17.cu = null;
                        var2_17.ab = null;
                        var2_17.aP = null;
                        var2_17.ck = null;
                        var2_17.cj = null;
                        var2_17.ci = null;
                        var2_17.ck = null;
                        var2_17.ad = null;
                        var2_17 = var3_3;
                        var3_3.aC = null;
                        var2_17.cc = null;
                        var2_17.ca = null;
                        var2_17.aB = null;
                        var13_27 = System.currentTimeMillis();
                        if (var13_27 - var11_10 < 1000L) {
                            try {
                                Thread.sleep(1000L - (var13_27 - var11_10));
                            }
                            catch (Exception v9) {}
                        }
                        e.a(e.u, true);
                        var3_3.aL = false;
                        var3_3.Q = false;
                        var3_3.A = false;
                    } else {
                        var3_3.aL = true;
                    }
                } else if (var3_3.C != -1) {
                    if (var3_3.R) {
                        if (var3_3.aa == 2) {
                            var3_3.f(1);
                        }
                    } else {
                        switch (var3_3.aa) {
                            case 1: {
                                var2_18 = var3_3;
                                var4_32 = b.d.a("cu2", -1);
                                var5_36 = var4_32.length / var2_18.bx;
                                var2_18.aO = new short[var5_36][var2_18.bx];
                                var6_45 = 1;
                                while (var6_45 < var5_36) {
                                    var8_58 = var6_45 * var2_18.bx;
                                    var7_51 = 0;
                                    while (var7_51 < var2_18.bx) {
                                        var2_18.aO[var6_45][var7_51] = var4_32[var8_58 + var7_51];
                                        ++var7_51;
                                    }
                                    ++var6_45;
                                }
                                break;
                            }
                            case 2: {
                                var4_31 = var3_3.T;
                                var2_19 = var3_3;
                                var6_46 = b.d.a("obj0", -1);
                                var7_52 = var6_46.length / (var2_19.bJ * var2_19.bK);
                                var5_35 = new byte[var7_52][var2_19.bJ * var2_19.bK];
                                var8_58 = 0;
                                var9_59 = 0;
                                while (var9_59 < var7_52) {
                                    var10_60 = 0;
                                    while (var10_60 < var2_19.bC) {
                                        var5_35[var9_59][var10_60] = var6_46[var8_58];
                                        if (var5_35[var9_59][var10_60] < 0) {
                                            v10 = var5_35[var9_59];
                                            v11 = var10_60;
                                            v10[v11] = (byte)(v10[v11] + 256);
                                        }
                                        ++var8_58;
                                        ++var10_60;
                                    }
                                    ++var9_59;
                                }
                                var10_60 = -1;
                                var6_46 = b.d.a("ll", -1);
                                var7_52 = var6_46.length;
                                if (var4_31 == 0) {
                                    var10_60 = 0;
                                } else {
                                    var8_58 = 0;
                                    var9_59 = 0;
                                    var11_11 = 9;
                                    while (var11_11 < var7_52) {
                                        if (var6_46[var11_11] == 0 && var6_46[var11_11 + 1] == 0 && var6_46[var11_11 + 2] == 0) {
                                            var8_58 = (byte)(var8_58 + 1);
                                        }
                                        if (var8_58 == 4) {
                                            if (var4_31 == (var9_59 = (int)((byte)(var9_59 + 1)))) {
                                                var10_60 = var11_11 + 3;
                                                break;
                                            }
                                            var11_11 += 9;
                                            var8_58 = 0;
                                        }
                                        var11_11 += 3;
                                    }
                                }
                                var2_19.bH = var6_46[var10_60];
                                var2_19.bI = var6_46[var10_60 + 1];
                                if (var2_19.bH < 0) {
                                    var2_19.bH += 256;
                                }
                                if (var2_19.bI < 0) {
                                    var2_19.bI += 256;
                                }
                                var2_19.bL = (var2_19.bH << 4) - var2_19.e;
                                var2_19.bM = (var2_19.bI << 4) - var2_19.b;
                                var2_19.bU = var2_19.bL + var2_19.e - 32;
                                var2_19.cR = new byte[var2_19.bH][var2_19.bI];
                                var8_58 = 0;
                                var2_19.ay = 0;
                                var9_59 = var10_60 + 9;
                                while (var9_59 < var7_52) {
                                    if (var6_46[var9_59] == 0 && var6_46[var9_59 + 1] == 0 && var6_46[var9_59 + 2] == 0) {
                                        var8_58 = var9_59 + 3;
                                        break;
                                    }
                                    ++var2_19.ay;
                                    var9_59 += 3;
                                }
                                var2_19.cd = new int[var2_19.ay][6];
                                var2_19.ay *= 3;
                                var11_12 = 0;
                                var9_59 = var10_60 + 9;
                                while (var9_59 < var2_19.ay + var10_60 + 9) {
                                    var2_19.cd[var11_12][0] = var6_46[var9_59];
                                    if (var2_19.cd[var11_12][0] < 0) {
                                        v12 = var2_19.cd[var11_12];
                                        v12[0] = v12[0] + 256;
                                    }
                                    var2_19.cd[var11_12][1] = var6_46[var9_59 + 1] + 1;
                                    if (var2_19.cd[var11_12][1] < 0) {
                                        v13 = var2_19.cd[var11_12];
                                        v13[1] = v13[1] + 256;
                                    }
                                    var2_19.cd[var11_12][2] = (var2_19.cd[var11_12][0] << 4) + (16 - var2_19.aO[var6_46[var9_59 + 2] - 31][2] >> 1);
                                    var2_19.cd[var11_12][3] = var2_19.cd[var11_12][1] << 4;
                                    var2_19.cd[var11_12][4] = var6_46[var9_59 + 2] - 100;
                                    if (var2_19.cd[var11_12][4] < 0) {
                                        v14 = var2_19.cd[var11_12];
                                        v14[4] = v14[4] + 256;
                                    }
                                    var2_19.cd[var11_12][5] = 0;
                                    ++var11_12;
                                    var9_59 += 3;
                                }
                                var2_19.ay /= 3;
                                var9_59 = var8_58;
                                while (var9_59 < var8_58 + 15) {
                                    if (var6_46[var9_59 + 2] == -7) {
                                        var2_19.aU[0][0] = 16 * var6_46[var9_59];
                                        var2_19.aU[0][1] = 16 * var6_46[var9_59 + 1];
                                    }
                                    if (var6_46[var9_59 + 2] == -6) {
                                        var2_19.aU[1][0] = 16 * var6_46[var9_59];
                                        var2_19.aU[1][1] = 16 * var6_46[var9_59 + 1];
                                    }
                                    if (var6_46[var9_59 + 2] == -5) {
                                        var2_19.aW[0][0] = 16 * var6_46[var9_59];
                                        var2_19.aW[0][1] = 16 * var6_46[var9_59 + 1];
                                    }
                                    if (var6_46[var9_59 + 2] == -4) {
                                        var2_19.aW[1][0] = 16 * var6_46[var9_59];
                                        var2_19.aW[1][1] = 16 * var6_46[var9_59 + 1];
                                    }
                                    var9_59 += 3;
                                }
                                var2_19.aU[0][2] = -1;
                                var2_19.aU[1][2] = -1;
                                var8_58 += 15;
                                var9_59 = 0;
                                var11_12 = 0;
                                var12_14 = 0;
                                var13_28 = 0;
                                var14_29 = 0;
                                var15_61 = var8_58;
                                while (var15_61 < var7_52) {
                                    if (var6_46[var15_61] == 0 && var6_46[var15_61 + 1] == 0 && var6_46[var15_61 + 2] == 0) break;
                                    if (var2_19.t == 3 || var2_19.t == 1) {
                                        switch (var6_46[var15_61 + 2]) {
                                            case -2: {
                                                ++var14_29;
                                                break;
                                            }
                                            case -3: {
                                                ++var13_28;
                                            }
                                        }
                                    } else {
                                        ++var9_59;
                                    }
                                    var15_61 += 3;
                                }
                                if (var2_19.t == 3 || var2_19.t == 1) {
                                    var2_19.bP = (byte)var14_29;
                                    var2_19.bO = (byte)var13_28;
                                    var2_19.cj = new short[var14_29 << 1];
                                    var2_19.ci = new short[var13_28 << 1];
                                } else {
                                    var2_19.bN = (byte)var9_59;
                                    var2_19.ck = new short[var9_59 << 1];
                                }
                                var9_59 = var8_58;
                                while (var9_59 < var7_52) {
                                    if (var6_46[var9_59] == 0 && var6_46[var9_59 + 1] == 0 && var6_46[var9_59 + 2] == 0) {
                                        var8_58 = var9_59 + 3;
                                        break;
                                    }
                                    if (var2_19.t == 3 || var2_19.t == 1) {
                                        switch (var6_46[var9_59 + 2]) {
                                            case -2: {
                                                var2_19.cj[var11_12] = var6_46[var9_59];
                                                var2_19.cj[var11_12 + 1] = var6_46[var9_59 + 1];
                                                var11_12 += 2;
                                                break;
                                            }
                                            case -3: {
                                                var2_19.ci[var12_14] = var6_46[var9_59];
                                                var2_19.ci[var12_14 + 1] = var6_46[var9_59 + 1];
                                                var12_14 += 2;
                                            }
                                        }
                                    } else {
                                        var2_19.ck[var11_12] = var6_46[var9_59];
                                        var2_19.ck[var11_12 + 1] = var6_46[var9_59 + 1];
                                        var11_12 += 2;
                                    }
                                    var9_59 += 3;
                                }
                                while (var8_58 < var7_52) {
                                    if (var6_46[var8_58] == 0 && var6_46[var8_58 + 1] == 0 && var6_46[var8_58 + 2] == 0) break;
                                    var9_59 = 0;
                                    var11_12 = 0;
                                    var12_14 = 0;
                                    while (var12_14 < var2_19.bJ * var2_19.bK) {
                                        if (var11_12 == var2_19.bJ) {
                                            var11_12 = 0;
                                            ++var9_59;
                                        }
                                        if (var6_46[var8_58] < 0) {
                                            v15 = var8_58;
                                            var6_46[v15] = (byte)(var6_46[v15] + 256);
                                        }
                                        if (var6_46[var8_58 + 1] < 0) {
                                            v16 = var8_58 + 1;
                                            var6_46[v16] = (byte)(var6_46[v16] + 256);
                                        }
                                        if (var6_46[var8_58 + 2] < 0) {
                                            v17 = var8_58 + 2;
                                            var6_46[v17] = (byte)(var6_46[v17] + 256);
                                        }
                                        if (var6_46[var8_58] + var11_12 < var2_19.bH && var6_46[var8_58 + 1] + var9_59 < var2_19.bI && var5_35[var6_46[var8_58 + 2] - 1][var12_14] != false) {
                                            var2_19.cR[var6_46[var8_58] + var11_12][var6_46[var8_58 + 1] + var9_59] = (byte)var5_35[var6_46[var8_58 + 2] - 1][var12_14];
                                        }
                                        ++var11_12;
                                        ++var12_14;
                                    }
                                    var8_58 += 3;
                                }
                                var6_46 = b.d.a("wlg", -1);
                                var9_59 = 0;
                                if (var2_19.cP != null) {
                                    var2_19.cP = null;
                                }
                                var2_19.cP = new byte[16][6];
                                var11_12 = 0;
                                while (var11_12 < 16) {
                                    var12_14 = 0;
                                    while (var12_14 < 6) {
                                        var2_19.cP[var11_12][var12_14] = var6_46[var9_59];
                                        ++var9_59;
                                        ++var12_14;
                                    }
                                    ++var11_12;
                                }
                                var6_46 = b.d.a("wpn", -1);
                                var5_37 = var6_46.length;
                                if (var4_31 == 0) {
                                    var10_60 = 0;
                                } else {
                                    var7_52 = 0;
                                    var8_58 = 0;
                                    while (var8_58 < var5_37) {
                                        if (var6_46[var8_58] == 0 && var6_46[var8_58 + 1] == 0 && var6_46[var8_58 + 2] == 0 && ++var7_52 == var4_31) {
                                            var10_60 = var8_58 + 3;
                                            break;
                                        }
                                        var8_58 += 3;
                                    }
                                }
                                if (var2_19.cO != null) {
                                    var2_19.cO = null;
                                }
                                var2_19.cO = new byte[var2_19.bH][var2_19.bI];
                                var7_52 = var10_60;
                                while (var7_52 < var5_37) {
                                    if (var6_46[var7_52] == 0 && var6_46[var7_52 + 1] == 0 && var6_46[var7_52 + 2] == 0) break;
                                    v18 = var2_19.cO[var6_46[var7_52]];
                                    v19 = var6_46[var7_52 + 1] + 1;
                                    var4_31 = var6_46[var7_52 + 2] + 256;
                                    var8_58 = 0;
                                    switch (var4_31) {
                                        case 243: {
                                            var8_58 = 5;
                                            break;
                                        }
                                        case 245: {
                                            var8_58 = 3;
                                            break;
                                        }
                                        case 246: {
                                            var8_58 = 2;
                                            break;
                                        }
                                        case 247: {
                                            var8_58 = 1;
                                            break;
                                        }
                                        case 242: {
                                            var8_58 = 6;
                                        }
                                    }
                                    v18[v19] = var8_58;
                                    var7_52 += 3;
                                }
                                var2_19.cg = var2_19.bM;
                                break;
                            }
                            case 3: {
                                var2_20 = var3_3;
                                var9_59 = 0;
                                var4_33 = b.d.a("ca", -1);
                                var5_38 = var4_33.length / var2_20.bw;
                                var2_20.aH = new short[var5_38][];
                                var10_60 = 1;
                                var6_47 = 0;
                                while (var6_47 < var5_38) {
                                    var8_58 = var6_47 * var2_20.bw;
                                    var9_59 = 0;
                                    if (var6_47 == 79 || var6_47 == 90 || var6_47 == 91 || var6_47 == 108 || var6_47 == 109 || var6_47 == 110 || var6_47 == 189 || var6_47 == 200 || var6_47 == 201 || var6_47 == 207 || var6_47 == 218 || var6_47 == 219) {
                                        var10_60 = var2_20.bw;
                                    }
                                    var7_53 = 0;
                                    while (var7_53 < var2_20.bw) {
                                        if (var4_33[var8_58 + var7_53 + 2] == 0 && var4_33[var8_58 + var7_53 + 1] == 0 && var4_33[var8_58 + var7_53] == 0) {
                                            var10_60 = var7_53;
                                            break;
                                        }
                                        var7_53 += 3;
                                    }
                                    var2_20.aH[var6_47] = new short[var10_60];
                                    var7_53 = 0;
                                    while (var7_53 < var10_60) {
                                        var2_20.aH[var6_47][var7_53] = var4_33[var8_58 + var7_53];
                                        if (var9_59 == 2) {
                                            if (var2_20.aH[var6_47][var7_53] > 60 && 65 > var2_20.aH[var6_47][var7_53]) {
                                                var2_20.aH[var6_47][var7_53] = 0;
                                            }
                                            if (var2_20.aH[var6_47][var7_53] < 0) {
                                                v20 = var2_20.aH[var6_47];
                                                v21 = var7_53;
                                                v20[v21] = (short)(v20[v21] + 256);
                                            }
                                        }
                                        v22 = (byte)(var9_59 + 1);
                                        var9_59 = v22;
                                        if (v22 == 3) {
                                            var9_59 = 0;
                                        }
                                        ++var7_53;
                                    }
                                    ++var6_47;
                                }
                                break;
                            }
                            case 4: {
                                var2_21 = var3_3;
                                var4_34 = b.d.a("mua", -1);
                                var5_39 = var4_34.length / var2_21.by;
                                var2_21.bX = new short[var5_39][var2_21.by];
                                var6_48 = 0;
                                while (var6_48 < var5_39) {
                                    var8_58 = var6_48 * var2_21.by;
                                    var7_54 = 0;
                                    while (var7_54 < var2_21.by) {
                                        var2_21.bX[var6_48][var7_54] = var4_34[var8_58 + var7_54];
                                        if (var2_21.bX[var6_48][var7_54] < 0 && var7_54 == 0) {
                                            v23 = var2_21.bX[var6_48];
                                            v24 = var7_54;
                                            v23[v24] = (short)(v23[v24] + 256);
                                        }
                                        ++var7_54;
                                    }
                                    ++var6_48;
                                }
                                break;
                            }
                            case 5: {
                                var2_22 = var3_3;
                                var7_55 = b.d.a("cc", -1);
                                var9_59 = var7_55.length;
                                var2_22.bt = var9_59 / 11;
                                var2_22.aJ = new byte[11][var2_22.bt];
                                var6_49 = 0;
                                var5_40 = 0;
                                while (var5_40 < var2_22.bt) {
                                    var4_31 = 0;
                                    while (var4_31 < 11) {
                                        var2_22.aJ[var4_31][var5_40] = var7_55[var6_49];
                                        ++var6_49;
                                        ++var4_31;
                                    }
                                    if (var2_22.aJ[0][var5_40] < 0) {
                                        v25 = var2_22.aJ[0];
                                        v26 = var5_40;
                                        v25[v26] = (byte)(v25[v26] + 256);
                                    }
                                    if (var2_22.aJ[1][var5_40] < 0) {
                                        v27 = var2_22.aJ[1];
                                        v28 = var5_40;
                                        v27[v28] = (byte)(v27[v28] + 256);
                                    }
                                    if (var2_22.aJ[2][var5_40] < 0) {
                                        v29 = var2_22.aJ[2];
                                        v30 = var5_40;
                                        v29[v30] = (byte)(v29[v30] + 256);
                                    }
                                    if (var2_22.aJ[3][var5_40] < 0) {
                                        v31 = var2_22.aJ[3];
                                        v32 = var5_40;
                                        v31[v32] = (byte)(v31[v32] + 256);
                                    }
                                    ++var5_40;
                                }
                                break;
                            }
                            case 6: {
                                var3_3.r();
                                break;
                            }
                            case 7: {
                                var2_23 = var3_3;
                                var3_3.cu = new byte[var2_23.I];
                                var2_23.ab = new int[var2_23.I][28];
                                switch (var2_23.t) {
                                    case 0: {
                                        var4_31 = 0;
                                        while (var4_31 < var2_23.I) {
                                            var2_23.cu[var4_31] = (byte)var4_31;
                                            ++var4_31;
                                        }
                                        break;
                                    }
                                    case 1: {
                                        var5_41 = var2_23.g[0];
                                        while (var5_41 < var2_23.I) {
                                            var2_23.cu[var5_41] = 1;
                                            ++var5_41;
                                        }
                                        break;
                                    }
                                    case 2: {
                                        var6_50 = 0;
                                        while (var6_50 < var2_23.I) {
                                            var2_23.cu[var6_50] = (byte)var6_50;
                                            ++var6_50;
                                        }
                                        break;
                                    }
                                    case 3: {
                                        var7_56 = var2_23.g[0];
                                        while (var7_56 < var2_23.I) {
                                            var2_23.cu[var7_56] = 1;
                                            ++var7_56;
                                        }
                                        break;
                                    }
                                    case 4: {
                                        var8_58 = 0;
                                        while (var8_58 < var2_23.I) {
                                            var2_23.cu[var8_58] = (byte)var8_58;
                                            ++var8_58;
                                        }
                                        break;
                                    }
                                }
                                var2_23.aP = new int[var2_23.I];
                                var9_59 = 0;
                                while (var9_59 < var2_23.I) {
                                    var2_23.ab[var9_59][9] = var2_23.bX[var2_23.ab[var9_59][20]][1];
                                    var2_23.ab[var9_59][10] = var2_23.bX[var2_23.ab[var9_59][20]][2];
                                    var2_23.ab[var9_59][5] = var2_23.bX[var2_23.ab[var9_59][20]][5];
                                    var2_23.ab[var9_59][23] = var2_23.bX[var2_23.ab[var9_59][20]][5];
                                    var2_23.ab[var9_59][26] = var2_23.bX[var2_23.ab[var9_59][20]][6];
                                    var2_23.aP[var9_59] = (65536 + (var2_23.ab[var9_59][23] >> 1)) / var2_23.ab[var9_59][23];
                                    var2_23.ab[var9_59][24] = var2_23.ab[var9_59][5] * var2_23.ab[var9_59][9] * var2_23.aP[var9_59] >> 16;
                                    var2_23.ab[var9_59][25] = 65280;
                                    if (var2_23.ab[var9_59][9] - var2_23.ab[var9_59][24] >= (var2_23.ab[var9_59][9] >> 2) + (var2_23.ab[var9_59][9] >> 1)) {
                                        var2_23.ab[var9_59][25] = 0xFF0000;
                                    } else if (var2_23.ab[var9_59][9] - var2_23.ab[var9_59][24] >= var2_23.ab[var9_59][9] >> 2) {
                                        var2_23.ab[var9_59][25] = 0xFFFF00;
                                    }
                                    var2_23.ab[var9_59][18] = var2_23.bX[var2_23.ab[var9_59][20]][3];
                                    var2_23.ab[var9_59][19] = var2_23.bX[var2_23.ab[var9_59][20]][4];
                                    if (var9_59 < var2_23.g[0]) {
                                        var2_23.ab[var9_59][20] = 1;
                                    }
                                    v33 = var2_23.ab[var9_59];
                                    v33[20] = v33[20] * 110;
                                    if (var2_23.t == 3 && var2_23.cu[var9_59] == 0) {
                                        var2_23.ab[var9_59][4] = 1;
                                    }
                                    ++var9_59;
                                }
                                break;
                            }
                            case 8: {
                                var3_3.f(0);
                                d.a();
                            }
                        }
                    }
                    if (var3_3.aa == 20) {
                        var3_3.C = -1;
                        var3_3.aa = (short)(var3_3.aa + 1);
                        var3_3.bT = var3_3.bT;
                        var3_3.R = false;
                    } else {
                        var3_3.aa = (short)(var3_3.aa + 1);
                    }
                }
                this.l();
            } else {
                if (!this.d) {
                    var3_4 = System.currentTimeMillis();
                    this.i();
                    var5_42 = System.currentTimeMillis();
                    this.cH = var5_42 - var3_4;
                }
                if (var1_30 != this.K) {
                    if (var1_30 > 4 && var1_30 < 11) {
                        this.W = 77;
                    }
                    var3_5 = this;
                    this.bW = null;
                    if (var3_5.K < 11) {
                        var3_5.bW = new c(var3_5, var3_5.b("text"));
                    }
                    switch (var3_5.K) {
                        case 11: {
                            var3_5.bW = new c(var3_5, var3_5.c("text2"));
                            break;
                        }
                        case 12: {
                            var3_5.bW = new c(var3_5, var3_5.c("text1"));
                            break;
                        }
                        case 13: {
                            var3_5.bW = new c(var3_5, var3_5.p());
                            break;
                        }
                        case 14: {
                            var3_5.bW = new c(var3_5, var3_5.p());
                            break;
                        }
                        case 19: {
                            var3_5.bW = new c(var3_5, var3_5.b("text"));
                            break;
                        }
                        case 20: {
                            var3_5.bW = new c(var3_5, null);
                            break;
                        }
                        case 21: {
                            var3_5.bW = new c(var3_5, null);
                            break;
                        }
                        case 22: {
                            var3_5.bW = new c(var3_5, null);
                            break;
                        }
                        case 25: {
                            var3_5.bW = new c(var3_5, var3_5.cE);
                        }
                    }
                    var1_30 = this.K;
                }
                if (!e.J) {
                    var3_6 = System.currentTimeMillis();
                    this.l();
                    var5_43 = System.currentTimeMillis();
                    this.cp -= var5_43 - var3_6;
                    if (this.cp < 0L && this.au != 0) {
                        --this.au;
                        this.cp = 60000L + this.cp;
                    }
                } else {
                    var3_7 = System.currentTimeMillis();
                    this.l();
                    var5_44 = System.currentTimeMillis();
                    if (var2_16 != 0) {
                        this.ce = this.ce == 0L ? 300L : 77L;
                        if (var5_44 - var3_7 < this.ce) {
                            try {
                                var7_57 = this.ce - (var5_44 - var3_7) >> 3;
                                var2_16 = 0;
                                while ((long)var2_16 < var7_57) {
                                    Thread.sleep(8L);
                                    if (this.bm != 0) {
                                        ++var2_16;
                                        continue;
                                    }
                                    break;
                                }
                            }
                            catch (Exception v34) {}
                        }
                        if (this.bm == 0) {
                            this.ce = 0L;
                        }
                    } else {
                        this.ce = 0L;
                    }
                }
            }
            do {
                if (this.j) continue block141;
lbl988:
                // 2 sources

            } while (this.j);
        }
        b.a[2] = e.ac != false ? 1 : 0;
        b.a[5] = e.n;
        b.c = true;
        b.b();
        b.c();
        tr.a.destroyApp(true);
        tr.a.notifyDestroyed();
        tr.a = null;
    }

    public final void showNotify() {
        super.showNotify();
        try {
            this.l();
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    public final void e() {
        int n = this.O.length >> 1;
        int[] nArray = new int[n];
        int n2 = 0;
        while (n2 < n) {
            nArray[n2] = this.O[n2 << 1];
            this.U[n2] = (byte)n2;
            ++n2;
        }
        n2 = 1;
        while (n2 < n) {
            int n3 = nArray[n2];
            byte by = this.U[n2];
            int n4 = n2;
            while (n4 > 0 && nArray[n4 - 1] < n3) {
                nArray[n4] = nArray[n4 - 1];
                this.U[n4] = this.U[n4 - 1];
                --n4;
            }
            nArray[n4] = n3;
            this.U[n4] = by;
            ++n2;
        }
    }

    private static void a(int n, boolean bl) {
        if (!bl && n >= u) {
            return;
        }
        if (V) {
            if (d.a == null) {
                d.a(tr.b);
            }
            if (bl) {
                n = u;
            }
            d.a(n);
        }
    }

    public static void f() {
        d.a();
    }

    private final String[] b(String stringArray) {
        int n = this.K;
        if (n == 19) {
            n = 4;
        }
        stringArray = b.d.b((String)stringArray);
        int n2 = stringArray[n].length;
        String[] stringArray2 = new String[n2];
        int n3 = 0;
        while (n3 < n2) {
            stringArray2[n3] = stringArray[n][n3];
            ++n3;
        }
        return stringArray2;
    }

    public final String[] a(String string) {
        return b.a(b.d.c(string), this.s, 10000, false);
    }

    private final String[] c(String string) {
        return b.a(b.d.c(string), this.s, this.e - (this.e / 13 << 1) - 1, true);
    }

    public final String[] a(String string, int n) {
        return b.a(string, this.s, n, true);
    }

    private static void v() {
        if (ac) {
            try {
                d.b();
                return;
            }
            catch (Exception exception) {}
        }
    }
}

