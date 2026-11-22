import com.nokia.mid.ui.FullCanvas;
import java.util.Random;
import javax.microedition.lcdui.Display;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class e extends FullCanvas implements Runnable {
   private int[][] ad;
   private byte ae;
   private short[][] af;
   private int ag;
   private byte ah;
   private byte ai;
   private byte aj;
   private byte ak;
   private byte al;
   private byte am;
   boolean a;
   int b;
   int c;
   private int an;
   private int ao;
   private byte[][] ap;
   boolean d;
   private short[] aq;
   private int ar;
   private int as;
   private short at;
   private int au;
   int e;
   private int av;
   int f;
   private int aw;
   private int ax;
   private int ay;
   private byte[][] az;
   private int aA;
   private Image aB;
   int[] g;
   private Image[] aC;
   private int aD;
   private int aE;
   private int aF;
   private int[] aG;
   private short[][] aH;
   private boolean aI;
   private byte[][] aJ;
   byte[][] h;
   String i;
   private boolean aK;
   boolean j;
   private boolean aL;
   private byte[] aM;
   private byte aN;
   private short[][] aO;
   Image k;
   byte l;
   byte m;
   private int[] aP;
   private byte[] aQ;
   static byte n = 2;
   static byte o = 2;
   Image p;
   Image q;
   Image r;
   private static int[] aR;
   private byte[] aS;
   private byte[] aT;
   private int[][] aU;
   private byte aV;
   private int[][] aW;
   private int aX;
   private int aY;
   private int aZ;
   a s;
   private int ba;
   private byte bb;
   private byte bc;
   private boolean bd;
   int t;
   private byte be;
   private byte bf;
   private byte bg;
   private byte bh;
   private boolean bi;
   private int bj;
   private boolean bk;
   private boolean bl;
   private int bm;
   private int bn;
   private boolean bo;
   private boolean bp;
   private int bq;
   private int br;
   private int bs;
   private int bt;
   private byte bu;
   private byte bv;
   private byte bw;
   private byte bx;
   private byte by;
   static int u = 9;
   static byte v = 0;
   Image w;
   static int x = 32;
   byte y;
   boolean z;
   boolean A;
   Image B;
   int C;
   private Image bz;
   private byte[] bA;
   private byte bB;
   private int bC;
   int D;
   private byte bD;
   private int bE;
   private int bF;
   int E;
   private int bG;
   int F;
   private int bH;
   private int bI;
   private byte bJ;
   private byte bK;
   private int bL;
   private int bM;
   private byte bN;
   private byte bO;
   private byte bP;
   int G;
   private int bQ;
   private int bR;
   private int bS;
   int H;
   private short bT;
   byte I;
   private int bU;
   private byte bV;
   private c bW;
   static boolean J = true;
   byte K;
   private short[][] bX;
   private Random bY = new Random();
   boolean L;
   static String M = "ertem";
   private boolean bZ;
   private Image[] ca;
   private Image[] cb;
   private Image[] cc;
   private int[][] cd;
   byte N;
   private long ce;
   byte[] O;
   static int P = 0;
   private int cf;
   private int cg;
   boolean Q;
   private byte[] ch;
   boolean R;
   private short[] ci;
   private short[] cj;
   private short[] ck;
   boolean S;
   int T;
   private String cl;
   private byte[] cm;
   private byte cn;
   private int[] co;
   private long cp;
   private byte[] cq;
   private int[][] cr;
   private byte cs;
   private int ct;
   private byte[] cu;
   private long cv;
   private byte[][] cw;
   private short[][] cx;
   byte[] U;
   static boolean V = true;
   private byte[] cy;
   private int cz;
   private int cA;
   private int cB;
   private int[][] cC;
   private int cD;
   int W;
   byte X;
   private String[] cE;
   private int[] cF;
   byte Y;
   private long cG;
   private long cH;
   String[] Z;
   private Thread cI;
   private byte[] cJ;
   private byte cK;
   short aa;
   private short[] cL;
   private byte cM;
   int[][] ab;
   static boolean ac = true;
   private byte cN;
   private byte[][] cO;
   private byte[][] cP;
   private byte[] cQ;
   private byte[][] cR;
   private int cS;
   private int cT;
   private short[] cU;

   public e() {
      this.e = this.getWidth();
      this.b = this.getHeight();
      this.f = this.e >> 1;
      this.c = this.b >> 1;
      this.d = true;
      this.be = 0;
      this.bb = 1;
      this.aV = 0;
      this.co = new int[]{0, 0, 0, 0, 0, 0};
      this.cE = new String[]{""};
      this.bD = 6;
      this.Y = 0;
      this.cm = new byte[]{0, 0};
      this.ba = 2;
      this.bc = 2;
      this.as = 0;
      this.cn = 0;
      this.F = 15;
      this.H = 5;
      this.I = 10;
      this.D = 20;
      this.E = 10;
      this.G = 20;
      this.g = new int[]{0, 0};
      this.ao = 103;
      this.bN = 6;
      this.aW = new int[][]{{1142, 240}, {32, 240}};
      this.aU = new int[][]{{950, 200, -1}, {160, 240, -1}};
      this.aq = new short[]{0, 0, 0, 0, 0, 0};
      this.aQ = new byte[]{0, 0, 0, 0, 0, 0};
      this.at = 0;
      this.cK = 20;
      this.bV = 0;
      this.cy = new byte[]{1, 3, 7, 10, 5, 10};
      this.ay = 1;
      this.ap = new byte[][]{
         {54, 49},
         {48, 46, 47},
         {42, 41, 39},
         {42, 41, 40},
         {38, 37, 36},
         {35, 34, 33},
         {45, 43, 44},
         {111, 110, 109, 108, 107, 107},
         {112, 113, 114, 114},
         {115, 116, 117, 117}
      };
      this.cC = new int[50][7];
      this.bA = new byte[]{0, 0, 0, 0};
      this.aM = new byte[]{0, 0, 0, 0, 0, 0};
      this.cJ = new byte[]{0, 0, 0, 0, 0, 0};
      this.ct = 0;
      this.cD = 0;
      this.ad = new int[][]{{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}};
      this.af = new short[][]{{1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}, {1, 0, 0, 1}};
      this.az = new byte[][]{{-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}, {-1, -1}};
      this.cU = new short[12];
      this.aS = new byte[]{0, 0, 0, 0, 0, 0};
      this.aT = new byte[]{43, 46, 0, 0, 0, 0};
      this.cu = new byte[]{0, 0, 0, 1, 1, 1};
      this.ab = new int[][]{
         {300, 240, 0, 0, 0, 100, 100, 1, 1, 13, 22, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0},
         {1100, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 4, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0},
         {1120, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 100, 0},
         {230, 40, 0, 0, 0, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0},
         {49, 40, 0, 0, 1, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0},
         {60, 40, 0, 0, 1, 8, 100, 0, 1, 13, 22, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 0}
      };
      this.cM = 0;
      this.cf = 0;
      this.cg = 0;
      this.bq = 1;
      this.br = 2;
      this.bs = 9;
      this.bJ = 5;
      this.bK = 5;
      this.bu = 11;
      this.bv = 7;
      this.bx = 7;
      this.bw = 24;
      this.by = 25;
      this.T = 0;
      this.bS = 4;
      this.cA = 40;
      this.cz = 60;
      this.cB = this.e / this.cA + 1;
      this.aN = 0;
      this.aZ = 0;
      this.aY = 128;
      this.aX = 0;
      this.aD = 0;
      this.bU = 0;
      this.bZ = false;
      this.bj = 0;
      this.bG = 0;
      this.aG = new int[4];
      this.cF = new int[4];
      this.ae = 0;
      this.cQ = new byte[]{0, 61, 62, 63, 64, 0};
      this.ag = 50;
      this.ak = 5;
      this.ai = 10;
      this.ah = 30;
      this.al = 35;
      this.am = 100;
      this.aj = -25;
      this.cL = new short[]{0, 0, 80, 130, 200, 300};
      this.bB = 10;
      this.aI = false;
      this.K = 0;
      this.y = 11;
      this.N = 4;
      this.R = false;
      this.S = true;
      this.aL = false;
      this.A = false;
      this.Q = false;
      this.aa = 0;
      this.C = 0;
      this.z = false;
      this.cv = 0L;
      this.bd = true;
      this.bi = true;
      this.X = 0;
      this.j = true;
      this.aK = false;
      this.W = 77;
      this.an = 35;
      this.bl = false;
      this.bk = false;
      this.bm = 0;
      this.bo = true;
      this.bp = false;
      this.aA = 16777215;
      this.cI = new Thread(this);
   }

   private final void a(int var1, int var2, byte var3) {
      if (this.cD != 15) {
         int var4 = 0;
         this.cD++;

         while (this.cC[var4][3] >= 1) {
            var4++;
         }

         this.cC[var4][0] = var1;
         this.cC[var4][1] = var2;
         this.cC[var4][3] = this.ap[var3].length + 1;
         this.cC[var4][2] = var3;
         this.cC[var4][6] = this.bj;
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
         this.ab[this.bj][2] = this.ab[this.bj][2] - (this.bc << 1);
      }

      if (this.aM[this.bj] == -1) {
         this.ab[this.bj][2] = this.ab[this.bj][2] - this.bc;
      }

      if (this.aM[this.bj] == 1) {
         this.ab[this.bj][2] = this.ab[this.bj][2] - (this.bc << 2);
      }

      if (this.ab[this.bj][2] < -this.ab[this.bj][18]) {
         this.ab[this.bj][2] = -this.ab[this.bj][18];
      }

      if (this.ab[this.bj][11] == 0) {
         this.az[this.bj][0] = 0;
      }
   }

   private final void i() {
      this.ae++;
      if (this.ae >= this.I) {
         this.ae = 0;
      }

      for (this.bj = 0; this.bj < this.I; this.bj++) {
         this.cJ[this.bj] = (byte)this.cJ[this.bj];
         if (this.cJ[this.bj] > 1) {
            this.cJ[this.bj] = 0;
         }

         if (this.ab[this.bj][12] == 0) {
            if (this.aQ[this.bj] < 2) {
               this.h(this.bj);
            }

            if (this.t != 4) {
               this.aQ[this.bj]--;
            }
         }

         e var1;
         label878: {
            label877: {
               var1 = this;
               e var2 = this;
               if (this.ab[var2.bj][11] == 1) {
                  if (var2.ab[var2.bj][3] < var2.bR) {
                     if (var2.aM[var2.bj] == 0) {
                        var2.ab[var2.bj][3] = var2.ab[var2.bj][3] + var2.ba;
                     }

                     if (var2.aM[var2.bj] == -1) {
                        var2.ab[var2.bj][3] = var2.ab[var2.bj][3] + (var2.ba >> 1);
                     }

                     if (var2.aM[var2.bj] == 1) {
                        var2.ab[var2.bj][3] = var2.ab[var2.bj][3] + (var2.ba << 1);
                     }
                  } else {
                     var2.ab[var2.bj][3] = var2.bR;
                  }

                  var2.ab[var2.bj][1] = var2.ab[var2.bj][1] + var2.ab[var2.bj][3];
                  var2.j();
                  if (var2.ab[var2.bj][3] <= 0) {
                     break label877;
                  }

                  if (var2.ab[var2.bj][12] == 1) {
                     var2.az[var2.bj][0] = 2;
                  }

                  if (var2.aJ[6][var2.cR[var2.cS][var2.cT]] == 0) {
                     break label877;
                  }

                  if (var2.ab[var2.bj][12] == 1) {
                     var2.az[var2.bj][0] = 3;
                  }

                  var2.ab[var2.bj][1] = (var2.cT << 4) + var2.aJ[6][var2.cR[var2.cS][var2.cT]];
                  var2.ab[var2.bj][11] = 0;
                  var2.ab[var2.bj][3] = 0;
                  var2.n();
               } else {
                  var2.j();
                  if (var2.aJ[6][var2.cR[var2.cS][var2.cT]] == 0) {
                     var2.af[var2.bj][1] = 0;
                     var2.ab[var2.bj][11] = 1;
                     var2.ab[var2.bj][3] = 0;
                     boolean var72 = true;
                     break label878;
                  }

                  if (var2.aJ[9][var2.cR[var2.cS][var2.cT]] == 0) {
                     var2.ab[var2.bj][1] = (var2.cT << 4) + var2.aJ[6][var2.cR[var2.cS][var2.cT]];
                  }
               }

               boolean var71 = false;
               break label878;
            }

            boolean var10000 = true;
         }

         e var24 = var1;
         var1.ab[var24.bj][0] = var1.ab[var24.bj][0] + var24.ab[var24.bj][2];
         if (var24.ab[var24.bj][2] != 0) {
            if (var24.ab[var24.bj][2] > 0) {
               e var3 = var24;
               if (!var24.n() && var3.ab[var3.bj][0] - var3.aw + (var3.ab[var3.bj][9] >> 1) >= 16) {
                  var3.cS++;
                  if (var3.cT != 0) {
                     var3.cT--;
                  }

                  if (var3.cT > 0 && var3.aJ[6][var3.cR[var3.cS][var3.cT]] == 2) {
                     var3.ab[var3.bj][0] = var3.aw + 16 - (var3.ab[var3.bj][9] >> 1);
                  }
               }

               var24.ab[var24.bj][2] = var24.ab[var24.bj][2] - var24.bc;
               if (var24.ab[var24.bj][2] < 0) {
                  var24.ab[var24.bj][2] = 0;
               }
            } else {
               e var33 = var24;
               if (!var24.n() && var33.ab[var33.bj][0] - var33.aw - (var33.ab[var33.bj][9] >> 1) <= 0) {
                  var33.cS--;
                  var33.cT--;
                  if (var33.cT > 0 && var33.aJ[6][var33.cR[var33.cS][var33.cT]] == 2) {
                     var33.ab[var33.bj][0] = var33.aw + (var33.ab[var33.bj][9] >> 1);
                  }
               }

               var24.ab[var24.bj][2] = var24.ab[var24.bj][2] + var24.bc;
               if (var24.ab[var24.bj][2] > 0) {
                  var24.ab[var24.bj][2] = 0;
               }
            }
         }

         var1.j();
         var1 = this;
         label896:
         if (this.ab[var1.bj][12] == 1 && var1.bj != var1.Y) {
            if (var1.af[var1.bj][3] > -1) {
               var1.af[var1.bj][3]--;
               if (var1.af[var1.bj][3] == -1) {
                  e var4 = var1;
                  var1.af[var4.bj][3] = 20;
                  var4.ab[var4.bj][27] = var4.c(100);
                  if (var4.af[var4.bj][0] == 0) {
                     if (var4.ab[var4.bj][27] == 50) {
                        var4.af[var4.bj][0] = 2;
                     }

                     if (var4.ab[var4.bj][27] > 95) {
                        var4.af[var4.bj][0] = 6;
                        var4.af[var4.bj][3] = (byte)(var4.c(150) + 20);
                     }

                     for (int var5 = 0; var5 < var4.I; var5++) {
                        if (var4.cu[var5] != var4.cu[var4.bj]) {
                           if (g(var4.ab[var5][0] - var4.ab[var4.bj][0]) < var4.e) {
                              var4.ab[var4.bj][13] = var5;
                              var4.af[var4.bj][0] = 1;
                              break;
                           }

                           var4.ab[var4.bj][13] = var5;
                        }
                     }
                  } else if (var4.af[var4.bj][0] == 1) {
                     if (var4.ab[var4.ab[var4.bj][13]][12] == 0) {
                        var4.af[var4.bj][0] = 0;
                     } else if (var4.ab[var4.bj][5] <= var4.ab[var4.bj][23] - (var4.ab[var4.bj][23] >> 1) || var4.ab[var4.bj][27] > 80) {
                        var4.ab[var4.bj][27] = var4.c(3);
                        var4.af[var4.bj][0] = 2;
                        var4.af[var4.bj][3] = 300;
                     }
                  } else if (var4.af[var4.bj][0] == 2) {
                     var4.af[var4.bj][0] = 4;
                     var4.af[var4.bj][3] = 150;
                  } else if (var4.af[var4.bj][0] == 4) {
                     var4.af[var4.bj][0] = 1;
                     var4.af[var4.bj][3] = 300;
                  } else if (var4.af[var4.bj][0] == 5) {
                     if (g(var4.aW[var4.cu[var4.bj]][0] - var4.ab[var4.bj][0]) < var4.e) {
                        var4.af[var4.bj][0] = 3;
                     }
                  } else if (var4.af[var4.bj][0] == 6) {
                     var4.af[var4.bj][0] = 1;
                     var4.af[var4.bj][3] = 300;
                  }
               }
            }

            if (var1.ae == var1.bj) {
               switch (var1.af[var1.bj][0]) {
                  case -1:
                  default:
                     break;
                  case 0:
                     if (32 > var1.ab[var1.bj][0]) {
                        var1.ab[var1.bj][4] = 1;
                     }

                     if (var1.bL + var1.e - 32 < var1.ab[var1.bj][0]) {
                        var1.ab[var1.bj][4] = 0;
                     }

                     var1.ad[var1.bj][0] = var1.ab[var1.bj][4] * (var1.bL + var1.e);
                     var1.af[var1.bj][1] = 1;
                     break;
                  case 1:
                     var1.cF[0] = var1.ab[var1.ab[var1.bj][13]][0];
                     var1.cF[1] = var1.ab[var1.ab[var1.bj][13]][1];
                     var1.cF[2] = var1.ab[var1.ab[var1.bj][13]][9];
                     var1.cF[3] = var1.ab[var1.ab[var1.bj][13]][10];
                     var1.a(var1.cF);
                     break;
                  case 2:
                     if (var1.t != 3 && var1.t != 1) {
                        var1.cF[0] = var1.ck[var1.ab[var1.bj][14] << 1] << 4;
                        var1.cF[1] = var1.ck[(var1.ab[var1.bj][14] << 1) + 1] << 4;
                     } else if (var1.cu[var1.bj] == 0) {
                        var1.cF[0] = var1.cj[var1.ab[var1.bj][14] << 1] << 4;
                        var1.cF[1] = var1.cj[(var1.ab[var1.bj][14] << 1) + 1] << 4;
                     } else {
                        var1.cF[0] = var1.ci[var1.ab[var1.bj][14] << 1] << 4;
                        var1.cF[1] = var1.ci[(var1.ab[var1.bj][14] << 1) + 1] << 4;
                     }

                     var1.cF[2] = 16;
                     var1.cF[3] = 32;
                     var1.a(var1.cF);
                     break;
                  case 3:
                     int var25 = var1.aW[1][0];
                     int var34 = 0;
                     if (var1.cu[var1.bj] == 0) {
                        var25 = var1.aW[0][0];
                     }

                     var34 = var1.aW[0][1];
                     var1.cF[0] = var25;
                     var1.cF[2] = 16;
                     var1.cF[1] = var34 - 16;
                     var1.cF[3] = 16;
                     var1.a(var1.cF);
                     break;
                  case 4:
                     var1.cF[0] = var1.cd[0][2];
                     var1.cF[2] = 16;
                     var1.cF[1] = var1.cd[0][3];
                     var1.cF[3] = 16;
                     var1.a(var1.cF);
                     break;
                  case 5:
                     if (var1.cu[var1.bj] == 0) {
                        var1.ab[var1.bj][4] = 0;
                     } else {
                        var1.ab[var1.bj][4] = 1;
                     }

                     var1.ad[var1.bj][0] = var1.ab[var1.bj][4] * (var1.bL + var1.e);
                     var1.af[var1.bj][1] = 1;
               }
            }

            byte var46 = var1.cO[var1.cS][var1.cT];
            e var41 = var1;
            byte var6 = 0;
            boolean var8 = false;
            int var26 = var41.e - var41.av;
            if (var41.ab[var41.bj][8] == 0) {
               var26 = 16;
            }

            var1 = var41;
            byte var36 = 6;

            while (var36 != 0) {
               var36--;
               if (var1.cx[var1.bj][var36] > 0 && var1.cw[var1.bj][var36] > 0) {
                  var1.ab[var1.bj][8] = var36;
                  break;
               }
            }

            for (byte var57 = 0; var57 < var41.I && var41.af[var41.bj][0] != 2; var57++) {
               if (var41.cu[var57] != var41.cu[var41.bj] && var41.ab[var57][12] != 0) {
                  int var7 = var41.ab[var41.bj][0] - var41.ab[var57][0];
                  var6 = 0;
                  if (var7 < 0) {
                     var7 = -var7;
                     var6 = 1;
                  }

                  if (var7 < var26
                     && var41.ab[var41.bj][1] - (var41.ab[var41.bj][10] >> 1) < var41.ab[var57][1] - 4
                     && var41.ab[var41.bj][1] - (var41.ab[var41.bj][10] >> 1) > var41.ab[var57][1] - var41.ab[var57][10]) {
                     if (var41.af[var41.bj][0] == 1 && var41.ab[var41.bj][27] < 3) {
                        if (var41.ab[var41.bj][11] == 0) {
                           var41.ab[var41.bj][27] = var41.c(20) + 1;
                        }

                        if (var41.ab[var41.bj][27] == 2) {
                           var41.g();
                        }
                        break;
                     }

                     if (var41.af[var41.bj][0] == 0) {
                        var41.ab[var41.bj][4] = 0;
                        if (var6 == 1) {
                           var41.ab[var41.bj][4] = 1;
                        }
                     }

                     if (var41.ab[var41.bj][4] == var6) {
                        if (var41.ab[var57][0] - (var41.ab[var57][9] >> 1) < var41.ab[var41.bj][0] + (var41.ab[var41.bj][9] >> 1)
                           && var41.ab[var57][0] + (var41.ab[var57][9] >> 1) > var41.ab[var41.bj][0] - (var41.ab[var41.bj][9] >> 1)) {
                           var41.ab[var41.bj][8] = 0;
                        }

                        var41.m();
                        break label896;
                     }
                  }
               }
            }

            if (var41.af[var41.bj][0] != 6) {
               boolean var10 = false;
               byte var11 = 3;
               if (var41.ab[var41.bj][11] == 0) {
                  var11 = 0;
               }

               byte[] var14;
               (var14 = new byte[3])[0] = 0;
               var14[1] = 0;
               var14[2] = 0;
               if (var41.ab[var41.bj][0] < 32) {
                  var41.k();
               } else if (var41.ab[var41.bj][0] > var41.bU) {
                  var41.h();
               } else {
                  if (var41.ad[var41.bj][0] - 32 > var41.ab[var41.bj][0]) {
                     var14[1] = 1;
                  } else if (var41.ad[var41.bj][0] + 32 < var41.ab[var41.bj][0]) {
                     var14[0] = 1;
                  }

                  for (byte var9 = 0; var9 < 3; var9++) {
                     switch (var41.cP[var46][var11 + var9]) {
                        case -1:
                           if (var41.af[var41.bj][0] == -1) {
                              var14[var9] = 0;
                           }
                        case 0:
                        case 1:
                        default:
                           break;
                        case 2:
                           var14[var41.ab[var41.bj][4]] = 1;
                           var14[2] = 1;
                           var10 = true;
                           break;
                        case 3:
                           var14[var9] = 0;
                           break;
                        case 4:
                           if (var41.af[var41.bj][2] == 4) {
                              var14[var9] = 1;
                           }
                           break;
                        case 5:
                           if (var41.af[var41.bj][2] == 5) {
                              var14[var9] = 1;
                           }
                     }
                  }

                  if (var14[0] == 0 && var14[1] == 0) {
                     var14[var41.ab[var41.bj][4]] = 1;
                  }

                  if (var41.af[var41.bj][1] == 1 || var10) {
                     if (var14[2] == 1) {
                        var41.g();
                     }

                     if (var14[0] == 1) {
                        var41.h();
                     } else if (var14[1] == 1) {
                        var41.k();
                     }
                  }
               }
            }
         }

         var1 = this;
         int var27 = this.cT;

         while (var1.aJ[6][var1.cR[var1.cS][var27]] == 0 && var27 < var1.bI - 1) {
            var27++;
         }

         var1.cU[var1.bj] = (short)(var27 << 4);
         var1.cU[var1.bj + var1.I] = 0;
         if (var1.aJ[6][var1.cR[var1.cS + 1][var27]] == 0 || var1.aJ[9][var1.cR[var1.cS + 1][var27]] != 0) {
            var1.cU[var1.bj + var1.I] = (short)(var1.ab[var1.bj][0] - (var1.cS << 4) + (var1.ab[var1.bj][9] >> 1));
         }

         if (var1.aJ[6][var1.cR[var1.cS - 1][var27]] == 0 || var1.aJ[9][var1.cR[var1.cS - 1][var27]] != 0) {
            var1.cU[var1.bj + var1.I] = (short)(-var1.ab[var1.bj][0] + (var1.cS << 4) + 16 + (var1.ab[var1.bj][9] >> 1));
         }

         if (this.cq[this.bj] == 1) {
            this.cq[this.bj] = 0;
            if (this.Y == this.bj) {
               this.m();
            }
         }

         var1 = this;
         if (this.az[var1.bj][1] != -1) {
            if (var1.ab[var1.bj][17] > -1) {
               var1.cJ[var1.bj] = 0;
               var1.az[var1.bj][1] = -1;
               var1.az[var1.bj][0] = 1;
               var1.ab[var1.bj][11] = 1;
               if (var1.aM[var1.bj] == 0) {
                  var1.ab[var1.bj][3] = -var1.bR;
               }

               if (var1.aM[var1.bj] == -1) {
                  var1.ab[var1.bj][3] = -var1.bR + (var1.bR >> 2);
               }

               if (var1.aM[var1.bj] == 1) {
                  var1.ab[var1.bj][3] = -var1.bR << 1;
               }
            }
         } else {
            switch (var1.az[var1.bj][0]) {
               case -1:
                  var1.ab[var1.bj][16] = 1;
                  var1.cJ[var1.bj] = 0;
                  break;
               case 0:
                  if (var1.ab[var1.bj][16] != 0 && var1.cJ[var1.bj] != 1) {
                     var1.ab[var1.bj][17] = -1;
                  }

                  var1.ab[var1.bj][16] = 0;
                  var1.az[var1.bj][0] = -1;
                  break;
               case 1:
                  var1.ab[var1.bj][16] = 4;
                  var1.ab[var1.bj][17] = 0;
                  var1.cJ[var1.bj] = 0;
                  break;
               case 2:
                  var1.ab[var1.bj][16] = 4;
                  var1.ab[var1.bj][17] = 1;
                  var1.cJ[var1.bj] = 0;
                  break;
               case 3:
                  var1.ab[var1.bj][16] = 4;
                  var1.ab[var1.bj][17] = 2;
                  var1.az[var1.bj][0] = -1;
                  var1.cJ[var1.bj] = 0;
                  break;
               case 4:
                  if (var1.ab[var1.bj][16] != 5) {
                     var1.ab[var1.bj][17] = -1;
                  }

                  var1.ab[var1.bj][16] = 5;
                  var1.cJ[var1.bj] = 0;
                  if (var1.ab[var1.bj][2] != 0 || var1.ab[var1.bj][11] != 0) {
                     var1.ab[var1.bj][17] = -1;
                  } else if (var1.ab[var1.bj][17] > 0) {
                     var1.ab[var1.bj][17] = 0;
                  }
                  break;
               case 5:
                  if (var1.ab[var1.bj][16] != 6) {
                     var1.ab[var1.bj][17] = -1;
                  }

                  var1.ab[var1.bj][16] = 6;
                  var1.cJ[var1.bj] = 0;
                  if (var1.ab[var1.bj][17] > 1) {
                     var1.ab[var1.bj][17] = 1;
                  }
            }

            if (var1.ch[var1.bj] == var1.cy[var1.ab[var1.bj][8]]) {
               var1.ab[var1.bj][16] = 2;
               if (var1.az[var1.bj][0] == 2) {
                  var1.ab[var1.bj][16] = 8;
               }

               if (var1.az[var1.bj][0] == 1) {
                  var1.ab[var1.bj][16] = 7;
               }
            }
         }

         if (var1.cJ[var1.bj] == 0) {
            var1.ab[var1.bj][17]++;
         }

         if (var1.ab[var1.bj][17] >= var1.bX[var1.ab[var1.bj][8]][8 + (var1.ab[var1.bj][16] << 1)]) {
            var1.ab[var1.bj][17] = 0;
         }

         var1 = this;
         if (this.ab[var1.bj][12] == 1) {
            for (int var28 = 0; var28 < var1.ay; var28++) {
               if (var1.cd[var28][1] == var1.cT && var1.cd[var28][0] == var1.cS && var1.cd[var28][5] == 0) {
                  if (var1.Y == var1.bj) {
                     byte var62 = 6;
                     a(6, false);
                  }

                  var1.cd[var28][5] = 80;
                  if (var1.cd[var28][4] > 1 && var1.cd[var28][4] < 7) {
                     var1.cx[var1.bj][var1.cd[var28][4] - 1] = (short)(var1.cx[var1.bj][var1.cd[var28][4] - 1] + 30);
                     if (var1.cx[var1.bj][var1.cd[var28][4] - 1] > 100) {
                        var1.cx[var1.bj][var1.cd[var28][4] - 1] = 100;
                     }
                  } else if (var1.cd[var28][4] > 8) {
                     var1.cd[var28][5] = var1.cL[var1.cd[var28][4] - 7];
                     var1.cw[var1.bj][var1.cd[var28][4] - 7] = 1;
                     var1.cx[var1.bj][var1.cd[var28][4] - 7] = (short)(var1.cx[var1.bj][var1.cd[var28][4] - 7] + 30);
                     if (var1.ab[var1.bj][8] < var1.cd[var28][4] - 7) {
                        var1.ab[var1.bj][8] = var1.cd[var28][4] - 7;
                     }

                     if (var1.cx[var1.bj][var1.cd[var28][4] - 7] > 100) {
                        var1.cx[var1.bj][var1.cd[var28][4] - 7] = 100;
                     }
                  } else {
                     switch (var1.cd[var28][4]) {
                        case 0:
                           if (var1.bj == var1.Y) {
                              var1.bA[2] = var1.bB;
                           }

                           if (var1.af[var1.bj][0] == 4) {
                              var1.af[var1.bj][0] = 1;
                           }

                           var1.ab[var1.bj][5] = var1.ab[var1.bj][5] + 30;
                           if (var1.ab[var1.bj][5] > var1.ab[var1.bj][23]) {
                              var1.ab[var1.bj][5] = var1.ab[var1.bj][23];
                           }

                           var1.b((byte)var1.bj);
                           break;
                        case 1:
                           if (var1.bj == var1.Y) {
                              var1.bA[3] = var1.bB;
                           }

                           var1.ab[var1.bj][6] = var1.ab[var1.bj][6] + 30;
                           if (var1.ab[var1.bj][6] > var1.ab[var1.bj][26]) {
                              var1.ab[var1.bj][6] = var1.ab[var1.bj][26];
                           }
                           break;
                        case 7:
                           var1.aq[var1.bj] = 200;
                           var1.cd[var28][5] = 200;
                     }
                  }
               }
            }
         }

         if (this.ch[this.bj] > 0) {
            this.ch[this.bj]--;
         }

         if (this.aq[this.bj] > 0) {
            this.aq[this.bj]--;
         }

         if (this.ab[this.bj][7] > 0) {
            this.ab[this.bj][7]--;
         }

         if (this.ab[this.bj][21] > 0) {
            this.ab[this.bj][21]--;
         }

         if (this.O[this.bj << 1] == this.F && (this.t == 0 || this.t == 1)) {
            this.c((byte)0);
         }

         if (this.t == 2 && this.O[(this.bj << 1) + 1] == this.D) {
            this.c((byte)1);
         }
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
            e var18 = this;
            if (0 == var18.Y) {
               for (int var29 = 0; var29 < var18.I; var29++) {
                  if (0 != var29 && var18.aM[var29] != 0) {
                     var18.aM[var29] = 0;
                     var18.ab[var29][18] = var18.ab[var29][18] << 1;
                     var18.cJ[var29] = 0;
                  }
               }
            } else {
               var18.aM[0] = 0;
               var18.cJ[0] = 0;
               var18.ab[0][18] = var18.ab[0][18] >> 1;
            }
         }

         this.at--;
      }

      this.bj = this.Y;
      e var19 = this;
      int var37 = 0;
      int var42 = 0;

      for (int var38 = 0; var38 < 15; var38++) {
         if (var19.cr[var38][6] >= 1) {
            var19.cr[var38][6]--;
            if (var19.cr[var38][6] < 1) {
               var19.ct--;
            } else {
               var19.cr[var38][10] = var19.cr[var38][9] == 4 && var19.cr[var38][10] == 0 ? 1 : 0;
               if (var19.cr[var38][9] == 3) {
                  var19.a(var19.cr[var38][0] - var19.cr[var38][2], var19.cr[var38][1] + var19.be, (byte)7);
               }

               if (var19.aM[var19.cr[var38][5]] == 0) {
                  var19.cr[var38][0] = var19.cr[var38][0] + var19.cr[var38][2];
               }

               if (var19.aM[var19.cr[var38][5]] == 1) {
                  var19.cr[var38][0] = var19.cr[var38][0] + (var19.cr[var38][2] << 1);
               }

               if (var19.aM[var19.cr[var38][5]] == -1) {
                  var19.cr[var38][0] = var19.cr[var38][0] + (var19.cr[var38][2] >> 1);
               }

               int var54 = var38;
               e var52 = var19;
               int var58 = var19.cr[var54][0] - (var52.cr[var54][7] >> 1);
               int var60 = var52.cr[var54][1] - (var52.cr[var54][8] >> 1);
               int var30 = var52.cr[var54][0] + (var52.cr[var54][7] >> 1);
               int var63 = var52.cr[var54][1] + (var52.cr[var54][8] >> 1);
               int var70 = 0;

               byte var73;
               while (true) {
                  if (var70 >= var52.I) {
                     var73 = -1;
                     break;
                  }

                  if (var52.cu[var70] != var52.cu[var52.cr[var54][5]]
                     && var52.ab[var70][12] == 1
                     && var58 < var52.ab[var70][0] + var52.bg
                     && var30 > var52.ab[var70][0] - var52.bg
                     && var60 < var52.ab[var70][1]
                     && var63 > var52.ab[var70][1] - var52.ab[var70][10]) {
                     var73 = (byte)var70;
                     break;
                  }

                  var70++;
               }

               var42 = var73;
               if (var73 != -1) {
                  if (var19.cr[var38][9] < 3) {
                     var19.a(var19.cr[var38][0], var19.cr[var38][1], (byte)0);
                  } else if (var19.cr[var38][9] == 3 || var19.cr[var38][9] == 5) {
                     if (var19.Y == var19.bj) {
                        boolean var64 = false;
                        a(0, false);
                     }

                     var19.a(var19.ab[var42][0], var19.ab[var42][1], (byte)var19.cr[var38][9]);
                     if (var19.c(2) == 0) {
                        var19.ab[var42][21] = var19.ab[var42][21] + 50;
                        var19.aT[var42] = 43;
                        if (var19.ab[var42][21] > 200) {
                           var19.ab[var42][21] = 200;
                        }
                     }
                  }

                  if (var19.cr[var38][9] == 4) {
                     var19.a(var19.ab[var42][0], var19.ab[var42][1], (byte)var19.cr[var38][9]);
                     if (var19.c(2) == 0) {
                        var19.ab[var42][21] = var19.ab[var42][21] + 50;
                        var19.aT[var42] = 46;
                        if (var19.ab[var42][21] > 100) {
                           var19.ab[var42][21] = 100;
                        }
                     }
                  }

                  if (var19.cr[var38][9] != 5) {
                     var19.cr[var38][6] = 0;
                     var19.ct--;
                  } else if (var19.ab[var19.cr[var38][5]][4] > 0) {
                     var19.cr[var38][7] = g(var19.cr[var38][0] - (var19.cr[var38][7] >> 1) - var19.ab[var42][0]);
                     var19.cr[var38][0] = var19.ab[var42][0] - (var19.cr[var38][7] >> 1);
                  } else {
                     var19.cr[var38][7] = g(var19.cr[var38][0] + (var19.cr[var38][7] >> 1) - var19.ab[var42][0]);
                     var19.cr[var38][0] = var19.ab[var42][0] + (var19.cr[var38][7] >> 1);
                  }

                  var19.ab[var42][6] = var19.ab[var42][6] - (var19.cr[var38][4] >> 2);
                  if (var19.ab[var42][6] < 0) {
                     var19.ab[var42][5] = var19.ab[var42][5] + (var19.ab[var42][6] << 2);
                     var19.ab[var42][6] = 0;
                  } else {
                     var19.ab[var42][5] = var19.ab[var42][5] - (var19.cr[var38][4] >> 1);
                  }

                  if (var19.ab[var19.cr[var38][5]][8] == 0 && var19.ab[var19.cr[var38][5]][16] == 2 && var19.ab[var19.cr[var38][5]][17] > 0) {
                     var19.ab[var19.cr[var38][5]][7] = 1;
                  }

                  var19.b(var42);
                  if (var19.ab[var42][5] <= 0) {
                     int var47 = 0;
                     switch (var19.cr[var38][9]) {
                        case 1:
                           var47 = var19.bR >> 1;
                           break;
                        case 2:
                           var47 = var19.bR >> 1;
                        case 3:
                        default:
                           break;
                        case 4:
                           var47 = var19.bR >> 1;
                           break;
                        case 5:
                           var47 = (var19.bR >> 1) + (var19.bR >> 2);
                     }

                     if (var19.ab[var42][5] > var19.aj) {
                        var19.az[var42][0] = 4;
                        if (var19.cr[var38][2] > 0) {
                           var19.ab[var42][2] = var47;
                           var19.ab[var42][4] = 0;
                        } else {
                           var19.ab[var42][2] = -var47;
                           var19.ab[var42][4] = 1;
                        }
                     } else {
                        var19.az[var42][0] = 5;
                     }

                     var19.ab[var42][21] = 0;
                     var19.az[var42][1] = -1;
                     var19.ab[var42][5] = 0;
                     var19.ab[var42][12] = 0;
                     var19.aQ[var42] = var19.cK;
                     if (var19.t == 4) {
                        var19.e(var42);
                     } else {
                        var19.O[var19.cr[var38][5] << 1]++;
                     }

                     var19.O[(var42 << 1) + 1]++;
                     if (var19.aU[0][2] == var42) {
                        var19.aU[0][2] = -1;
                     }

                     if (var19.aU[1][2] == var42) {
                        var19.aU[1][2] = -1;
                     }

                     if (var19.Y == var42) {
                        byte var65 = 4;
                        a(4, false);
                        v();
                     }
                  }
               }
            }
         }
      }

      var19 = this;
      int var31 = 0;

      for (int var55 = 0; var55 < var19.ay; var55++) {
         if (var19.cd[var55][5] > 0) {
            var19.cd[var55][5]--;
         }
      }

      if (var19.t == 3) {
         while (var31 < 2) {
            var37 = var19.aU[var31][0];
            var42 = var19.aU[var31][1] - var19.aO[var19.ao + var31][3];
            int var48 = var19.aU[var31][0] + var19.aO[var19.ao + var31][2];
            int var53 = var19.aU[var31][1] + var19.aO[98][3];
            int var59 = var37 >> 4;
            int var61 = var19.aU[var31][1] + var19.aO[98][3] >> 4;

            for (int var56 = 0; var56 < var19.I; var56++) {
               if (var19.ab[var56][12] == 1
                  && var37 < var19.ab[var56][0] + (var19.ab[var56][9] >> 1)
                  && var48 > var19.ab[var56][0] - (var19.ab[var56][9] >> 1)
                  && var42 < var19.ab[var56][1]
                  && var53 > var19.ab[var56][1] - var19.ab[var56][10]) {
                  if (var19.cu[var56] == 0) {
                     if (var31 == 0) {
                        if (var19.aU[var31][0] != var19.aW[var31][0] + (var19.aO[var19.ao - 1][2] >> 1) - 3
                           || var19.aU[var31][1] != var19.aW[var31][1] - var19.aO[98][3] + (var19.aO[var19.ao - 1][3] >> 1) - 3) {
                           var19.aU[var31][0] = var19.aW[var31][0] + (var19.aO[var19.ao - 1][2] >> 1) - 3;
                           var19.aU[var31][1] = var19.aW[var31][1] - var19.aO[98][3] + (var19.aO[var19.ao - 1][3] >> 1) - 3;
                        } else if (var19.aU[1][2] == var56) {
                           var19.bA[var31] = var19.bB;
                           var19.cm[var31]++;
                           var19.aU[1][0] = var19.aW[1][0];
                           var19.aU[1][1] = var19.aW[1][1];
                           var19.af[var19.aU[1][2]][0] = 0;
                           var19.aU[1][2] = -1;
                        }
                     } else if (var19.aU[var31][2] == -1) {
                        var19.aU[var31][2] = var56;
                        var19.af[var56][0] = 5;
                        if (var19.Y == var56) {
                           v();
                        }

                        if (var19.L) {
                           byte var66 = 3;
                           a(3, false);
                        } else {
                           byte var67 = 2;
                           a(2, false);
                        }
                     }
                  } else if (var31 == 1) {
                     if (var19.aU[var31][0] != var19.aW[var31][0] + (var19.aO[var19.ao - 1][2] >> 1) - 3
                        || var19.aU[var31][1] != var19.aW[var31][1] - var19.aO[98][3] + (var19.aO[var19.ao - 1][3] >> 1) - 3) {
                        var19.aU[var31][0] = var19.aW[var31][0] + (var19.aO[var19.ao - 1][2] >> 1) - 3;
                        var19.aU[var31][1] = var19.aW[var31][1] - var19.aO[98][3] + (var19.aO[var19.ao - 1][3] >> 1) - 3;
                     } else if (var19.aU[0][2] == var56) {
                        var19.bA[var31] = var19.bB;
                        var19.cm[var31]++;
                        var19.aU[0][0] = var19.aW[0][0];
                        var19.aU[0][1] = var19.aW[0][1];
                        var19.af[var19.aU[0][2]][0] = 0;
                        var19.aU[0][2] = -1;
                     }
                  } else if (var19.aU[var31][2] == -1) {
                     var19.aU[var31][2] = var56;
                     var19.af[var56][0] = 5;
                     if (var19.Y == var56) {
                        v();
                     }

                     if (var19.L) {
                        byte var68 = 2;
                        a(2, false);
                     } else {
                        byte var69 = 3;
                        a(3, false);
                     }
                  }
               }

               if (var19.aU[var31][2] != -1) {
                  var19.aU[var31][0] = var19.ab[var19.aU[var31][2]][0];
                  var19.aU[var31][1] = var19.ab[var19.aU[var31][2]][1] - var19.ab[var19.aU[var31][2]][10] - (var19.aO[98][3] >> 1);
               } else if (var61 > var19.bI - 3) {
                  var19.aU[var31][0] = var19.aW[var31][0] + (var19.aO[var19.ao - 1][2] >> 1) - 3;
                  var19.aU[var31][1] = var19.aW[var31][1] - var19.aO[98][3] + (var19.aO[var19.ao - 1][3] >> 1) - 3;
               } else if (var19.aJ[6][var19.cR[var59][var61]] == 0) {
                  var19.aU[var31][1] = var19.aU[var31][1] + 2;
               }
            }

            var31++;
         }
      }

      var19 = this;
      var31 = 0;
      var37 = 0;

      while (var31 < var19.cD) {
         if (var19.cC[var37][3] < 1) {
            var37++;
         } else {
            var19.cC[var37][3]--;
            if (var19.cC[var37][3] < 1) {
               var19.cD--;
            } else {
               if ((var19.cC[var37][2] == 2 || var19.cC[var37][2] == 3) && var19.cC[var37][3] == var19.ap[var19.cC[var37][2]].length) {
                  for (byte var45 = 0; var45 < var19.I; var45++) {
                     int var49;
                     if (var19.ab[var45][12] != 0
                        && (var49 = g(var19.ab[var45][0] - var19.cC[var37][0]) + g(var19.ab[var45][1] - var19.bh - var19.cC[var37][1])) < var19.ar) {
                        if (var19.c(2) == 0) {
                           var19.ab[var45][21] = var19.ab[var45][21] + 50;
                           var19.aT[var45] = 43;
                           if (var19.ab[var45][21] > 100) {
                              var19.ab[var45][21] = 100;
                           }
                        }

                        var19.ab[var45][2] = var19.ab[var45][0] - var19.cC[var37][0] > 0
                           ? (var19.bR >> 1) + (var19.bR >> 2)
                           : -(var19.bR >> 1) - (var19.bR >> 2);
                        if (var19.ag - var49 < 0) {
                           var49 = 0;
                        } else {
                           var49 = var19.ag - var49;
                        }

                        var19.ab[var45][6] = var19.ab[var45][6] - var49;
                        if (var19.ab[var45][6] < 0) {
                           var19.ab[var45][5] = var19.ab[var45][5] + (var19.ab[var45][6] << 2);
                           var19.ab[var45][6] = 0;
                        } else {
                           var19.ab[var45][5] = var19.ab[var45][5] - (var49 >> 1);
                        }

                        var19.b(var45);
                        if (var19.ab[var45][5] <= 0) {
                           if (var19.ab[var45][12] == 1 && var19.ab[var45][5] > var19.aj && var19.az[var45][0] != 4) {
                              var19.az[var45][0] = 4;
                              if (var19.ab[var45][0] - var19.cC[var37][0] > 0) {
                                 var19.ab[var45][2] = var19.bR;
                                 var19.ab[var45][4] = 0;
                              } else {
                                 var19.ab[var45][2] = -var19.bR;
                                 var19.ab[var45][4] = 1;
                              }
                           } else {
                              var19.az[var45][0] = 5;
                           }

                           var19.ab[var45][21] = 0;
                           var19.az[var45][1] = -1;
                           var19.ab[var45][5] = 0;
                           var19.ab[var45][12] = 0;
                           var19.aQ[var45] = var19.cK;
                           if (var45 == var19.cC[var37][6]) {
                              var19.O[var45 << 1] = (byte)(var19.O[var45 << 1] - 2);
                           }

                           if (var19.t == 4) {
                              var19.e(var45);
                           } else {
                              var19.O[var19.cC[var37][6] << 1]++;
                           }

                           var19.O[(var45 << 1) + 1]++;
                           if (var19.aU[0][2] == var45) {
                              var19.aU[0][2] = -1;
                           }

                           if (var19.aU[1][2] == var45) {
                              var19.aU[1][2] = -1;
                           }
                        }
                     }
                  }
               }

               var31++;
               var37++;
            }
         }
      }

      var19 = this;
      if (this.ab[var19.bj][4] == 1) {
         if (var19.cf + var19.bR < var19.ab[var19.bj][0] - var19.av) {
            var19.cf = var19.cf + var19.bR;
         } else {
            var19.cf = var19.ab[var19.bj][0] - var19.av;
         }
      } else if (var19.cf - var19.bR > var19.ab[var19.bj][0] - var19.e + var19.av) {
         var19.cf = var19.cf - var19.bR;
      } else {
         var19.cf = var19.ab[var19.bj][0] - var19.e + var19.av;
      }

      if (var19.aI) {
         if (var19.cg + var19.bR < var19.ab[var19.bj][1] - var19.ab[var19.bj][10]) {
            var19.cg = var19.cg + var19.bR;
         }
      } else if (var19.cg - var19.bR > var19.ab[var19.bj][1] - var19.b + var19.ab[var19.bj][10]) {
         var19.cg = var19.cg - var19.bR;
      } else {
         var19.cg = var19.ab[var19.bj][1] - (var19.b - var19.ab[var19.bj][10]);
      }

      var19.aI = false;
      if (var19.cg < 0) {
         var19.cg = 0;
      }

      if (var19.cg > var19.bM) {
         var19.cg = var19.bM;
      }

      if (var19.cf < 0) {
         var19.cf = 0;
      } else if (var19.cf > var19.bL) {
         var19.cf = var19.bL;
      }

      if (this.be > 1 || this.be < -1) {
         this.bb = (byte)(-this.bb);
      }

      this.aV++;
      if (this.aV > 2) {
         this.aV = 0;
      }

      this.be = (byte)(this.be + this.bb);
      if (this.cM > 0) {
         this.cM--;
      }

      for (int var23 = 0; var23 < 4; var23++) {
         if (this.bA[var23] > 0) {
            this.bA[var23]--;
         }
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
            this.ab[this.bj][5] = 0;
            if (this.ab[this.bj][12] == 1) {
               if (this.Y == this.bj) {
                  byte var1 = 4;
                  a(4, false);
                  v();
               }

               this.aQ[this.bj] = this.cK;
               this.ab[this.bj][12] = 0;
               this.O[(this.bj << 1) + 1]++;
               if (this.t == 4) {
                  this.e(this.bj);
               }
            }

            this.ab[this.bj][21] = 0;
            this.az[this.bj][0] = 4;
            byte var2 = 0;
            if (this.cu[this.bj] == 0) {
               var2 = 1;
            }

            if (this.aU[var2][2] == this.bj) {
               this.aU[var2][2] = -1;
               this.aU[var2][0] = this.aW[var2][0] + (this.aO[this.ao - 1][2] >> 1);
               this.aU[var2][1] = this.aW[var2][1] - this.aO[98][3] + (this.aO[this.ao - 1][3] >> 1);
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
         this.ab[this.bj][2] = this.ab[this.bj][2] + (this.bc << 1);
      }

      if (this.aM[this.bj] == -1) {
         this.ab[this.bj][2] = this.ab[this.bj][2] + this.bc;
      }

      if (this.aM[this.bj] == 1) {
         this.ab[this.bj][2] = this.ab[this.bj][2] + (this.bc << 2);
      }

      if (this.ab[this.bj][2] > this.ab[this.bj][18]) {
         this.ab[this.bj][2] = this.ab[this.bj][18];
      }

      if (this.ab[this.bj][11] == 0) {
         this.az[this.bj][0] = 0;
      }
   }

   private final int c(int var1) {
      return Math.abs(this.bY.nextInt() % var1);
   }

   private void l() {
      long var1 = System.currentTimeMillis();
      this.repaint();
      this.serviceRepaints();
      long var5 = System.currentTimeMillis() - var1;
      this.cG = var5;
      long var7 = this.W;
      if (var5 < var7) {
         try {
            Thread.sleep(var7 - var5);
            return;
         } catch (Exception var9) {
         }
      }
   }

   private final void m() {
      byte var1;
      if (((var1 = (byte)this.ab[this.bj][8]) != 0 || this.ab[this.bj][11] != 1) && this.ct != 15) {
         if (this.ch[this.bj] == 0 && this.cx[this.bj][var1] > 0) {
            int var2 = 0;
            this.ch[this.bj] = this.cy[var1];
            this.ct++;
            if (var1 > 0) {
               this.cx[this.bj][var1]--;
            }

            while (this.cr[var2][6] >= 1) {
               var2++;
            }

            int var3 = this.bX[this.ab[this.bj][8]][0] + this.bX[this.ab[this.bj][8]][11] + this.ab[this.bj][20];
            if (this.ab[this.bj][11] == 1) {
               var3 += 11;
            }

            byte var4 = (byte)(this.ab[this.bj][4] == 1 ? 1 : -1);
            this.cr[var2][2] = this.cs * var4;
            if (var1 != 0) {
               this.cr[var2][0] = this.ab[this.bj][0] + this.aH[var3][this.aH[var3].length - 3] * var4;
               this.cr[var2][1] = this.ab[this.bj][1] + this.aH[var3][this.aH[var3].length - 2] - (var1 != 5 ? (this.aO[this.cQ[var1]][3] >> 1) + 1 : 3);
            } else {
               this.cr[var2][0] = this.ab[this.bj][0];
               this.cr[var2][1] = this.ab[this.bj][1] - this.bh;
            }

            if (var1 != 5) {
               this.cr[var2][7] = this.aO[this.cQ[var1]][2];
               this.cr[var2][8] = this.aO[this.cQ[var1]][3];
            }

            this.cr[var2][5] = this.bj;
            this.cr[var2][9] = var1;
            switch (var1) {
               case 0:
                  this.cr[var2][4] = this.ak;
                  this.cr[var2][6] = 2;
                  this.cr[var2][7] = 20;
                  this.cr[var2][8] = 5;
                  if (this.Y == this.bj) {
                     byte var7 = 8;
                     a(8, false);
                  }
                  break;
               case 1:
                  this.cr[var2][4] = this.ai;
                  this.cr[var2][6] = 20;
                  break;
               case 2:
                  this.cr[var2][4] = this.ah;
                  this.cr[var2][6] = 20;
                  break;
               case 3:
                  this.cr[var2][4] = 0;
                  this.cr[var2][6] = 20;
                  this.ab[this.bj][2] = this.ab[this.bj][4] == 0 ? this.bR >> 1 : -this.bR >> 1;
                  if (this.Y == this.bj) {
                     boolean var6 = true;
                     a(1, false);
                  }
                  break;
               case 4:
                  this.cr[var2][4] = this.al;
                  this.cr[var2][6] = 20;
                  break;
               case 5:
                  this.cr[var2][2] = 0;
                  this.cr[var2][4] = this.am;
                  this.cr[var2][6] = 2;
                  this.cr[var2][7] = this.e;
                  this.cr[var2][8] = 5;
                  this.cr[var2][0] = this.cr[var2][0] + (this.ab[this.bj][4] == 0 ? -this.e >> 1 : this.e >> 1);
                  if (this.Y == this.bj) {
                     byte var5 = 5;
                     a(5, false);
                  }
            }

            if (this.aq[this.bj] > 0) {
               this.cr[var2][4] = this.cr[var2][4] * 3;
            }
         }

         if (this.cx[this.bj][var1] == 0) {
            this.t();
         }
      }
   }

   private final boolean n() {
      if (this.ab[this.bj][11] != 0 || this.aJ[9][this.cR[this.cS][this.cT]] == 0) {
         return false;
      } else if (this.aJ[9][this.cR[this.cS][this.cT]] == 2) {
         this.ab[this.bj][1] = this.ax + (this.ab[this.bj][0] - this.aw >> 1) + this.aJ[6][this.cR[this.cS][this.cT]];
         return true;
      } else if (this.aJ[9][this.cR[this.cS][this.cT]] == -2) {
         this.ab[this.bj][1] = this.ax + (-this.ab[this.bj][0] + this.aw + 16 >> 1) + this.aJ[6][this.cR[this.cS][this.cT]];
         return true;
      } else {
         return true;
      }
   }

   private static int a(byte var0) {
      int var1 = var0;
      if (var0 < 0) {
         var1 = var0 + 256;
      }

      return var1;
   }

   private static Image a(Image var0, int var1, int var2, int var3, int var4, int var5) {
      var1 = var3;
      var2 = var4;
      Image var15 = Image.createImage(var1, var2);
      Image var6 = Image.createImage(var1, var2);
      Graphics var7;
      (var7 = var15.getGraphics()).setColor(0);
      var7.fillRect(0, 0, var1, var2);
      var7.drawImage(var0, 0, 0, 20);
      (var7 = var6.getGraphics()).setColor(16777215);
      var7.fillRect(0, 0, var1, var2);
      var7.drawImage(var0, 0, 0, 20);
      int[] var8 = new int[var1 * var2];
      var15.getRGB(var8, 0, var1, 0, 0, var1, var2);
      int[] var16 = new int[var1 * var2];
      var6.getRGB(var16, 0, var1, 0, 0, var1, var2);

      for (int var11 = 0; var11 < var8.length; var11++) {
         if ((var8[var11] & 16777215) <= 2105376 && (var16[var11] & 16777215) >= 14671839) {
            var8[var11] = 0;
         }
      }

      int[] var18 = var8;
      int[] var20 = new int[var8.length];
      var5 = 0;

      for (int var12 = 0; var12 < var4; var12++) {
         var2 = var3 - 1;

         for (int var9 = 0; var9 < var3; var9++) {
            var20[var5 * var3 + var2] = var18[var12 * var3 + var9];
            var2--;
         }

         var5++;
      }

      return Image.createRGBImage(var20, var3, var4, true);
   }

   private final void o() {
      try {
         this.k = b.a("/curs.png");
      } catch (Exception var5) {
      }

      try {
         this.p = b.a("/erou.png");
      } catch (Exception var4) {
      }

      try {
         this.w = b.a("/ld.png");
      } catch (Exception var3) {
      }

      this.cb = new Image[this.br];

      for (int var1 = 0; var1 < this.cb.length; var1++) {
         try {
            this.cb[var1] = b.a("/s" + var1 + ".png");
         } catch (Exception var2) {
         }
      }

      this.r();
   }

   private final void a(Graphics var1, int var2, int var3, int var4, int var5, int var6, boolean var7) {
      int var8 = (this.cN + 1) * g(var6) + 8;
      if (var7) {
         var2 -= var8;
         if (var6 < 0) {
            var2 -= var8;
         }
      }

      var1.setColor(var5);
      var1.fillRect(var2, var3, var8, this.bf + 6);
      var1.setColor(var4);
      var1.drawRect(var2 + 1, var3 + 1, var8 - 2, this.bf + 4);
      var1.setColor(0);
      var1.drawRect(var2, var3, var8, this.bf + 6);
   }

   private final void a(Graphics var1) {
      int var2 = this.cf + this.e;
      int var3 = this.cg + this.b;
      int var4 = this.aO[this.ao + 1][2] >> 1;
      byte var5 = 1;
      short var6 = 0;
      if (this.t == 3) {
         if (this.aW[0][0] + 16 > this.cf && this.aW[0][0] < var2 && this.aW[0][1] > this.cg && this.aW[0][1] < var3) {
            this.b(var1, this.ao + 3, this.aW[0][0] - this.cf - 2, this.aW[0][1] - this.cg - 3);
         }

         if (this.aU[0][0] + var4 > this.cf && this.aU[0][0] - var4 < var2 && this.aU[0][1] > this.cg && this.aU[0][1] - this.aO[103][3] < var3) {
            var6 = this.aO[this.ao + 1][2];
            if (this.aU[0][2] != -1 && (var5 = (byte)(this.ab[this.aU[0][2]][4] == 1 ? 1 : -1)) == -1) {
               var6 = 2;
            }

            this.a(var1, this.ao + this.aV, this.aU[0][0] - this.cf - var6 + 2, this.aU[0][1] - this.cg - this.aO[103][3] - 2, var5);
            this.a(var1, 98, this.aU[0][0] - this.cf, this.aU[0][1] - this.cg - 2, var5);
         }

         if (this.aW[1][0] + 16 > this.cf && this.aW[1][0] < var2 && this.aW[1][1] > this.cg && this.aW[1][1] < var3) {
            this.b(var1, this.ao - 1, this.aW[1][0] - this.cf - 2, this.aW[1][1] - this.cg - 3);
         }

         if (this.aU[1][0] + var4 > this.cf && this.aU[1][0] - var4 < var2 && this.aU[1][1] > this.cg && this.aU[1][1] - this.aO[103][3] < var3) {
            var6 = this.aO[this.ao + 1][2];
            if (this.aU[1][2] != -1 && (var5 = (byte)(this.ab[this.aU[1][2]][4] == 1 ? 1 : -1)) == -1) {
               var6 = 2;
            }

            this.a(var1, this.ao + this.aV - 4, this.aU[1][0] - this.cf - var6 + 2, this.aU[1][1] - this.cg - this.aO[103][3] - 2, var5);
            this.a(var1, 98, this.aU[1][0] - this.cf, this.aU[1][1] - this.cg - 2, var5);
         }
      }

      var1.setColor(0);

      for (int var7 = 0; var7 < this.ay; var7++) {
         if (this.cd[var7][5] == 0
            && this.cd[var7][2] + 32 > this.cf
            && this.cd[var7][2] < this.cf + this.e
            && this.cd[var7][3] + 16 > this.cg
            && this.cd[var7][3] - 16 < this.cg + this.b) {
            var1.setClip(0, 0, this.e, this.b);
            var1.fillRoundRect(
               this.cd[var7][2] - this.cf - (this.be >> 2),
               this.cd[var7][3] - this.cg + 4 - 2,
               this.aO[this.cd[var7][4] + 69][2] + (this.be >> 1),
               4,
               this.aO[this.cd[var7][4] + 69][3],
               this.aO[this.cd[var7][4] + 69][3]
            );
            this.b(var1, this.cd[var7][4] + 69, this.cd[var7][2] - this.cf, this.cd[var7][3] - this.cg - this.aO[this.cd[var7][4] + 69][3] + this.be);
         }
      }
   }

   private final void b(Graphics var1) {
      int var2 = 0;
      int var3 = 0;

      while (var2 < this.ct) {
         if (this.cr[var3][6] == 0) {
            var3++;
         } else {
            if (this.cr[var3][9] == 5) {
               var1.setClip(0, 0, this.e, this.b);
               var1.setColor(16711680);
               var1.fillRect(
                  this.cr[var3][0] - this.cf - (this.cr[var3][7] >> 1),
                  this.cr[var3][1] - this.cg - (this.cr[var3][8] >> 1),
                  this.cr[var3][7],
                  this.cr[var3][8]
               );
               var1.setColor(16776960);
               var1.fillRect(
                  this.cr[var3][0] - this.cf - (this.cr[var3][7] >> 1),
                  this.cr[var3][1] - this.cg - (this.cr[var3][8] >> 2) + 1,
                  this.cr[var3][7],
                  (this.cr[var3][8] >> 1) - 1
               );
            } else if (this.cr[var3][9] != 0
               && this.cr[var3][0] > this.cf
               && this.cr[var3][0] < this.cf + this.e
               && this.cr[var3][1] > this.cg
               && this.cr[var3][1] < this.cg + this.b) {
               this.a(
                  var1,
                  60 + this.cr[var3][9] + this.cr[var3][10],
                  this.cr[var3][0] - this.cf - (this.cr[var3][7] >> 1),
                  this.cr[var3][1] - this.cg - (this.cr[var3][8] >> 1),
                  (byte)(this.cr[var3][2] <= 0 && this.cr[var3][9] != 1 ? -1 : 1)
               );
            }

            var2++;
            var3++;
         }
      }

      var1.setClip(0, 0, this.e, this.b);
   }

   private final void c(Graphics var1) {
      int var2 = 0;
      int var3 = 0;

      while (var2 < this.cD) {
         if (this.cC[var3][3] == 0) {
            var3++;
         } else {
            if (this.cC[var3][0] > this.cf && this.cC[var3][0] < this.cf + this.e && this.cC[var3][1] > this.cg && this.cC[var3][1] < this.cg + this.b) {
               byte var4 = this.ap[this.cC[var3][2]][this.cC[var3][3] - 1];
               this.b(
                  var1,
                  var4,
                  this.cC[var3][0] - this.cf - (this.aO[var4][2] >> 1),
                  this.cC[var3][1] - this.cg - (this.cC[var3][2] == 7 ? this.aO[var4][3] >> 1 : this.aO[var4][3])
               );
            }

            var2++;
            var3++;
         }
      }
   }

   private final void a(Graphics var1, String var2, int var3, int var4) {
      if (var2.charAt(0) == '0') {
         this.a(var1, var2.charAt(0) - '%', var3, var4);
      } else {
         byte var5 = (byte)var2.length();

         for (byte var6 = 0; var6 < var5; var6++) {
            this.a(var1, var2.charAt(var6) - '/', var3 + var6 * (this.h[2][1] + 1), var4);
         }
      }
   }

   private final void d(Graphics var1) {
      var1.setColor(0);

      for (int var7 = 0; var7 < this.I; var7++) {
         if (this.ab[var7][0] + this.ab[var7][9] > this.cf
            && this.ab[var7][0] - this.ab[var7][9] < this.cf + this.e
            && this.ab[var7][1] > this.cg
            && this.ab[var7][1] - this.ab[var7][10] < this.cg + this.b) {
            var1.setClip(0, 0, this.e, this.b);
            int var2 = this.ab[var7][0] - this.cf;
            int var3 = this.ab[var7][1] - this.cg;
            int var4 = this.bX[this.ab[var7][8]][0] + this.bX[this.ab[var7][8]][7 + (this.ab[var7][16] << 1)] + this.ab[var7][17] + this.ab[var7][20];
            byte var6 = (byte)(this.ab[var7][4] == 0 ? -1 : 1);
            int var5 = this.aH[var4].length;
            if (this.ab[var7][8] == 0 && this.ab[var7][7] == 0 && this.ab[var7][16] == 2 && this.ab[var7][17] > 0) {
               var5 -= 3;
            }

            if (this.ab[var7][12] == 1) {
               if (this.t == 3 || this.t == 1) {
                  if (this.cu[var7] == 0) {
                     this.ab[var7][25] = 255;
                  } else {
                     this.ab[var7][25] = 16711680;
                  }
               }

               var1.setColor(this.ab[var7][25]);
               var1.fillRect(var2 - this.bg + 1, var3 - this.ab[var7][10] - 10, this.ab[var7][24] - 1, 5);
               var1.setColor(0);
               var1.drawRect(var2 - this.bg, var3 - this.ab[var7][10] - 10, this.ab[var7][9] - 1, 5);
               if (this.cU[var7] != (this.bI << 4) - 16) {
                  var1.fillRoundRect(
                     var2 - this.bg + (this.cU[var7] - this.ab[var7][1] >> 1) + (this.cU[var7 + this.I] >> 1),
                     this.cU[var7] - this.cg,
                     this.ab[var7][9] - (this.cU[var7] - this.ab[var7][1]) - this.cU[var7 + this.I],
                     8,
                     100,
                     100
                  );
               }
            }

            for (byte var8 = 0; var8 < var5; var8 += 3) {
               short var10002 = this.aH[var4][var8 + 2];
               int var10003 = var6 * this.aH[var4][var8] + var2;
               int var10004 = this.aH[var4][var8 + 1] + var3;
               byte var14 = var6;
               int var13 = var10004;
               int var12 = var10003;
               short var11 = var10002;
               Graphics var10 = var1;
               e var9 = this;
               var13 -= var9.aO[var11][3];
               int var15 = var9.aO[var11][0];
               int var16 = 0;
               if (var14 == -1) {
                  var12 -= var9.aO[var11][2];
                  var15 = var9.cc[var9.aO[var11][var9.bx - 1]].getWidth() - var9.aO[var11][2] - var9.aO[var11][0];
                  var16 = var9.bs;
               }

               var10.setClip(var12, var13, var9.aO[var11][2], var9.aO[var11][3]);
               var10.drawImage(var9.cc[var9.aO[var11][var9.bx - 1] + var16], var12 - var15, var13 - var9.aO[var11][1], 20);
            }

            if (this.ab[var7][21] > 0) {
               if (this.ab[var7][11] == 0) {
                  this.a(var1, this.aT[var7] + this.aS[var7], var2, var3 - this.aO[46][3], var6);
               } else {
                  this.a(var1, this.aT[var7] + this.aS[var7], var2, var3 - this.aO[46][3] - 12, var6);
               }

               this.aS[var7]++;
               if (this.aS[var7] > 2) {
                  this.aS[var7] = 0;
               }
            }
         }
      }
   }

   private void a(Graphics var1, int var2, int var3) {
      if (n == 2) {
         if (this.aB != null) {
            int var4 = this.aB.getWidth() * this.cf / (this.bL + this.e);
            var1.setClip(0, 0, this.e, this.b);

            int var5;
            for (int var6 = var5 = var4 / this.aB.getWidth(); var6 < var5 + this.aE + 2; var6++) {
               var1.drawImage(this.aB, var6 * this.aF - var4, this.bM <= 0 ? 0 : -(this.cg * (this.aB.getHeight() - this.b)) / this.bM, 20);
            }
         }
      } else if (n == 1) {
         int var16 = this.bM <= 0 ? 0 : -(this.cg * (this.cz * this.bS - this.b)) / this.bM;

         for (int var21 = 0; var21 < this.bS; var21++) {
            int var19;
            if ((var19 = var16 + var21 * this.cz) < this.b && var19 + this.cz > 0) {
               for (int var7 = 0; var7 < this.cB; var7++) {
                  var1.drawImage(this.aC[var21], var7 * this.cA, var19, 20);
               }
            }
         }
      } else {
         var1.setColor(0, this.aY, 0);
         var1.fillRect(0, 0, this.e, this.b);
      }

      int var17 = var2 >> 4;
      int var20 = var3 >> 4;
      int var22 = this.bE + var17 + 2;
      int var23 = this.bF + var20 + 2;
      if (var20 < 0) {
         var20 = 0;
      }

      int var8 = var17;

      for (int var15 = (var17 << 4) - var2; var8 < var22 && var8 < this.bH; var15 += 16) {
         var17 = var20;

         for (int var9 = (var20 << 4) - var3; var17 < var23 && var17 < this.bI; var9 += 16) {
            if (this.cR[var8][var17] != 0) {
               byte var10002 = this.cR[var8][var17];
               int var14 = var9;
               int var13 = var15;
               byte var12 = var10002;
               Graphics var11 = var1;
               e var10 = this;
               var13 += var10.aJ[4][var12];
               var14 += var10.aJ[5][var12];
               var11.setClip(var13, var14, var10.aJ[2][var12], var10.aJ[3][var12]);
               var11.drawImage(var10.ca[var10.aJ[var10.bu - 1][var12]], var13 - var10.aJ[0][var12], var14 - var10.aJ[1][var12], 20);
            }

            var17++;
         }

         var8++;
      }
   }

   private static void a(Graphics var0, int var1, int var2, int var3, int var4, int var5, int var6) {
      boolean var9 = true;

      try {
         var2 = 0 + (100 << 24);
         if (Display.getDisplay(tr.a).numAlphaLevels() > 2) {
            if (aR == null || aR.length != var3 * var4 || aR[0] != var2) {
               if (aR == null || aR.length != var3 * var4) {
                  aR = new int[var3 * var4];
               }

               for (int var11 = 0; var11 < aR.length; var11++) {
                  aR[var11] = var2;
               }
            }

            var0.drawRGB(aR, 0, 0, 0, 0, var3, var4, true);
            var9 = false;
         }
      } catch (Exception var8) {
         aR = null;
      }

      if (var9) {
         try {
            var0.setColor(0);
            var0.fillRect(0, 0, var3, var4);
            return;
         } catch (Exception var7) {
         }
      }
   }

   private final void a(int[] var1) {
      int var2 = 0;
      if (this.ab[this.bj][1] - this.ab[this.bj][10] < var1[1] && this.ab[this.bj][1] > var1[1] - var1[3]) {
         this.ad[this.bj][0] = var1[0];
         this.af[this.bj][2] = 4;
         this.af[this.bj][1] = 1;
      } else {
         if (this.af[this.bj][2] == 4) {
            this.af[this.bj][1] = 0;
         }

         if (this.af[this.bj][1] == 0 && this.ab[this.bj][11] == 0) {
            boolean var3 = this.ab[this.bj][1] > var1[1];
            this.af[this.bj][1] = 1;
            int var4 = this.ab[this.bj][0] >> 4;
            int var5 = this.ab[this.bj][1] >> 4;
            int var6 = var4;
            int var7 = var5;
            int var8 = -1;
            int var9 = -1;
            this.aG[0] = var1[0] - (var1[2] >> 1);
            this.aG[1] = var1[1] - var1[3];
            this.aG[2] = var1[0] + (var1[2] >> 1);
            this.aG[3] = var1[1];
            boolean var10 = false;

            while (!var10) {
               var2++;
               if (var4 << 4 < this.aG[2] && (var4 << 4) + 16 > this.aG[0] && (var5 << 4) - 16 < this.aG[3] && var5 << 4 > this.aG[1]) {
                  this.af[this.bj][2] = 4;
                  this.ad[this.bj][0] = var1[0];
                  return;
               }

               if (var4 > this.bH - 2) {
                  var4 = -1;
                  break;
               }

               if (this.aJ[9][this.cR[var4 + 1][var5]] == -2) {
                  var5++;
               }

               if (this.aJ[9][this.cR[var4 + 1][var5]] == 2) {
                  var5--;
               }

               var4--;
               if (var4 < 0 || this.cO[var4][var5] == 0) {
                  var4 = -1;
                  break;
               }

               if (this.cO[var4][var5] == 3) {
                  var10 = !var10;
               }

               if (var3 && this.cO[var4][var5] == 5 && var8 == -1) {
                  var8 = var4;
               }
            }

            var10 = false;

            while (!var10) {
               var2++;
               if (var6 << 4 < this.aG[2] && (var6 << 4) + 16 > this.aG[0] && (var7 << 4) - 16 < this.aG[3] && var7 << 4 > this.aG[1]) {
                  this.af[this.bj][2] = 4;
                  return;
               }

               if (this.aJ[9][this.cR[var6 - 1][var7]] == 2) {
                  var7++;
               }

               if (this.aJ[9][this.cR[var6 - 1][var7]] == -2) {
                  var7--;
               }

               var6++;
               if (var6 > this.bH - 1 || this.cO[var6][var7] == 0) {
                  var6 = -1;
                  break;
               }

               if (this.cO[var6][var7] == 3) {
                  var10 = !var10;
                  var6++;
               }

               if (var3 && this.cO[var6][var7] == 5 && var9 == -1) {
                  var9 = var6;
               }
            }

            if (var3) {
               if (var8 == -1 && var9 == -1) {
                  this.af[this.bj][2] = 4;
                  this.ad[this.bj][0] = var1[0];
                  return;
               }

               this.af[this.bj][2] = 5;
               if ((var9 = var9 << 5) >= 0 && g(var1[0]) >= g(var9 - var1[0])) {
                  this.ad[this.bj][0] = var9;
                  return;
               }

               this.ad[this.bj][0] = 0;
               return;
            }

            if (var2 > this.bG) {
               this.bG = var2;
            }

            var4 <<= 4;
            var6 <<= 4;
            var5 <<= 4;
            var7 <<= 4;
            if (var4 > 0 && g(var1[0] - var4) + g(var1[1] - var5) < g(var1[0] - var6) + g(var1[1] - var7)) {
               this.ad[this.bj][0] = var4;
               this.ad[this.bj][1] = var5;
            } else {
               this.ad[this.bj][0] = var6;
               this.ad[this.bj][1] = var7;
            }

            this.af[this.bj][2] = 3;
         }
      }
   }

   final void a() {
      Display.getDisplay(tr.a).setCurrent(this);
      this.cI.start();
   }

   public final void hideNotify() {
      super.hideNotify();
   }

   private static byte d(int var0) {
      int var1 = var0;
      if (var0 > 127) {
         var1 = var0 - 256;
      }

      return (byte)var1;
   }

   protected final void KEYPRESSED(int var1) {
      if (var1 == -1) {
         var1 = 50;
      }

      if (var1 == -2) {
         var1 = 56;
      }

      if (var1 == -3) {
         var1 = 52;
      }

      if (var1 == -4) {
         var1 = 54;
      }

      if (var1 == -6 || var1 == -5) {
         var1 = 53;
      }

      if (var1 == -7) {
         var1 = this.an;
      }

      this.bn = var1;
      if (var1 != 42 && var1 != this.an && var1 != 48) {
         this.bl = true;
         this.bk = false;
      } else {
         this.bk = true;
         this.bl = false;
      }

      this.bo = false;
      this.bm = var1;
   }

   protected final void KEYRELEASED(int var1) {
      if (this.bo) {
         this.bm = 0;
      } else {
         this.bp = true;
      }
   }

   private void e(int var1) {
      if (this.cn != this.I - 1) {
         this.O[var1 << 1] = (byte)(this.O[var1 << 1] + this.cn);
         this.cn++;
         if (this.cn == this.I - 1) {
            for (int var2 = 0; var2 < this.I; var2++) {
               if (this.ab[var2][12] == 1) {
                  this.O[var2 << 1] = (byte)(this.O[var2 << 1] + this.cn);
                  break;
               }
            }

            this.cn = 0;
            this.s();
         }
      }
   }

   private final String[] p() {
      String[] var1 = new String[this.y + 1];

      for (int var2 = 0; var2 < this.y; var2++) {
         var1[var2] = var2 + 1 + ". Уровень";
      }

      var1[this.y] = "Назад";
      return var1;
   }

   private final void b(byte var1) {
      this.ab[var1][24] = this.ab[var1][5] * this.ab[var1][9] * this.aP[var1] >> 16;
      this.ab[var1][25] = 65280;
      if (this.ab[var1][9] - this.ab[var1][24] >= (this.ab[var1][9] >> 2) + (this.ab[var1][9] >> 1)) {
         this.ab[var1][25] = 16711680;
      } else {
         if (this.ab[var1][9] - this.ab[var1][24] >= this.ab[var1][9] >> 2) {
            this.ab[var1][25] = 16776960;
         }
      }
   }

   private final void q() {
      this.s = new a();
      String[] var1 = b.a(b.d.c("text4"), this.s, 10000, false);
      this.Z = new String[var1.length];

      for (int var2 = 0; var2 < var1.length; var2++) {
         this.Z[var2] = new String(var1[var2]);
      }

      this.bQ = (this.b - (this.b / 10 << 1)) / this.s.a();
      this.co = new int[this.bQ];
      this.cE = new String[this.bQ];

      for (int var3 = 0; var3 < this.bQ; var3++) {
         this.co[var3] = 0;
         this.cE[var3] = "Net Lizard";
      }

      this.av = this.e >> 2;
      this.bR = 16;
      this.cs = 8;
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
      byte[] var4;
      int var1 = (var4 = b.d.a("ccs", -1)).length;
      this.bt = var1 / 7;
      this.h = new byte[this.bu][this.bt];
      int var3 = 0;

      for (int var2 = 0; var2 < this.bt; var2++) {
         for (int var5 = 0; var5 < 7; var5++) {
            this.h[var5][var2] = var4[var3];
            var3++;
         }

         if (this.h[0][var2] < 0) {
            this.h[0][var2] = (byte)(this.h[0][var2] + 256);
         }

         if (this.h[1][var2] < 0) {
            this.h[1][var2] = (byte)(this.h[1][var2] + 256);
         }

         if (this.h[2][var2] < 0) {
            this.h[2][var2] = (byte)(this.h[2][var2] + 256);
         }

         if (this.h[3][var2] < 0) {
            this.h[3][var2] = (byte)(this.h[3][var2] + 256);
         }
      }
   }

   final void b() {
      try {
         this.q = b.a("/f1.png");
      } catch (Exception var2) {
      }

      try {
         this.r = b.a("/f2.png");
      } catch (Exception var1) {
      }
   }

   final void a(int var1) {
      if (this.B != null) {
         this.B = null;
      }

      try {
         this.B = b.a("/li" + var1 + ".png");
      } catch (Exception var2) {
      }
   }

   private final void f(int var1) {
      try {
         if (this.aB != null) {
            this.aB = null;
         }

         if (this.aC != null) {
            this.aC = null;
         }

         if (var1 == 0 || var1 == 1) {
            if (n == 1) {
               while (this.cz * this.bS <= this.b) {
                  this.bS++;
               }

               this.aC = new Image[this.bS];
               int var3 = this.cz * this.bS;
               int var4 = -1;
               int var5 = 0;
               Graphics var8 = null;

               for (int var9 = 0; var9 < var3; var9++) {
                  try {
                     int var2;
                     if ((var2 = var9 / this.cz) != var4) {
                        this.aC[var2] = Image.createImage(this.cA, this.cz);
                        var8 = this.aC[var2].getGraphics();
                        var5 = 0;
                        var4 = var2;
                     }

                     var2 = 255 + var9 * -255 / var3;
                     int var6 = 255 + var9 * 0 / var3;
                     int var7 = 255 + var9 * -255 / var3;
                     var8.setColor(var2, var6, var7);
                     var8.drawLine(0, var5, this.cA, var5);
                  } catch (Exception var17) {
                  }

                  var5++;
               }
            }

            if (n == 2) {
               this.aD = this.aD == 0 ? 1 : 0;

               try {
                  this.aB = b.a("/bg" + this.aD + ".png");
               } catch (Exception var16) {
               }

               int var20 = 0;
               if (this.aB != null) {
                  var20 = this.aB.getWidth();
                  this.aF = var20;
                  this.aE = this.e / var20;
               } else {
                  this.aD = this.aD == 0 ? 1 : 0;

                  try {
                     this.aB = b.a("/bg" + this.aD + ".png");
                  } catch (Exception var15) {
                  }

                  if (this.aB != null) {
                     var20 = this.aB.getWidth();
                     this.aF = var20;
                     this.aE = this.e / var20;
                  } else {
                     this.aE = -1;
                     n = 0;
                  }
               }
            }
         }
      } catch (Exception var18) {
      }

      if (var1 == 0) {
         this.cc = new Image[(this.bs << 1) - 1];

         for (int var27 = 0; var27 < this.bs; var27++) {
            Image var23 = null;

            try {
               this.cc[var27] = b.a("/u" + var27 + ".png");
            } catch (Exception var14) {
            }

            if (var27 < 5) {
               var23 = this.cc[var27];
               this.cc[var27 + this.bs] = a(var23, 0, 0, var23.getWidth(), var23.getHeight(), 2);
            }
         }
      }

      if (n == 0) {
         this.aN = (byte)(this.aN == 0 ? 1 : 0);
         this.ca = new Image[this.bq];
         Image var25 = null;

         for (int var28 = 0; var28 < this.ca.length; var28++) {
            try {
               var25 = b.a("/l" + this.aN + ".png");
            } catch (Exception var13) {
            }

            if (var25 == null) {
               this.aN = (byte)(this.aN == 0 ? 1 : 0);

               try {
                  var25 = b.a("/l" + this.aN + ".png");
               } catch (Exception var12) {
               }
            }

            this.ca[var28] = Image.createImage(var25.getWidth(), var25.getHeight());
            Graphics var29;
            (var29 = this.ca[var28].getGraphics()).setColor(0, this.aY, 0);
            var29.fillRect(0, 0, var25.getWidth(), var25.getHeight());
            var29.drawImage(var25, 0, 0, 20);
            var25 = null;
         }
      }

      if (n >= 1) {
         this.aN = (byte)(this.aN == 0 ? 1 : 0);
         this.ca = new Image[this.bq];

         for (int var26 = 0; var26 < this.ca.length; var26++) {
            try {
               this.ca[var26] = b.a("/l" + this.aN + ".png");
            } catch (Exception var11) {
            }

            if (this.ca[var26] == null) {
               this.aN = (byte)(this.aN == 0 ? 1 : 0);

               try {
                  this.ca[var26] = b.a("/l" + this.aN + ".png");
               } catch (Exception var10) {
               }
            }
         }
      }
   }

   public static final void c() {
      a(u, true);
   }

   private static int g(int var0) {
      return var0 < 0 ? -var0 : var0;
   }

   private void s() {
      if (this.as >= this.G) {
         this.c((byte)5);
      } else {
         this.as++;
         this.cn = 0;
         int var1 = this.c((int)this.bN);

         for (int var2 = 0; var2 < this.I; var2++) {
            if (var2 + var1 > this.bN - 1) {
               this.ab[var2][14] = var2 + var1 - this.bN;
            }

            this.h(var2);
         }

         for (int var3 = 0; var3 < this.ay; var3++) {
            this.cd[var3][5] = 0;
         }

         this.cM = 30;
         this.au = this.H;
         this.cp = 0L;
         this.ct = 0;
         this.cD = 0;
         this.cr = new int[20][11];
         this.cC = new int[25][7];
         this.aq = new short[this.I];
      }
   }

   private final void t() {
      byte var1;
      byte var2 = var1 = (byte)this.ab[this.bj][8];

      while (var2 != ++var1) {
         if (var1 > 5) {
            var1 = 0;
         }

         if (this.cw[this.bj][var1] == 1) {
            this.ab[this.bj][8] = var1;
            return;
         }
      }
   }

   public final void paint(Graphics var1) {
      try {
         if (!this.bd) {
            if (this.aA != -1) {
               var1.drawImage(this.bz, this.f - (this.bz.getWidth() >> 1), this.c - (this.bz.getHeight() >> 1), 20);
            } else if (this.A) {
               if (this.z) {
                  var1.setColor(0);
                  var1.fillRect(0, 0, this.e, this.b);
                  this.s.a(var1, this.Z[2], this.f - (this.s.a(this.Z[2]) >> 1), this.s.a() << 1, 20);
                  this.A = false;
                  this.z = false;
                  long var19 = System.currentTimeMillis();
                  if (V) {
                     a(u, true);
                  } else {
                     d.a();
                  }

                  long var23;
                  if ((var23 = System.currentTimeMillis()) - var19 < 1000L) {
                     this.cv = 1000L - (var23 - var19);
                  }
               } else {
                  Graphics var21 = var1;
                  e var18 = this;
                  if (this.Q) {
                     var21.setColor(0);
                     var21.fillRect(0, var18.s.a() << 1, var18.e, var18.s.a());
                     var18.s.a(var21, var18.Z[2], var18.f - (var18.s.a(var18.Z[2]) >> 1), var18.s.a() << 1, 20);
                  } else {
                     var21.setClip(0, 0, var18.e, var18.b);
                     var21.setColor(0);
                     var21.fillRect(0, var18.b - (var18.w.getHeight() >> 1), var18.e, var18.w.getHeight() >> 2);
                     if (var18.B != null) {
                        var21.setColor(0);
                        var21.fillRect(0, 0, var18.e, var18.b);
                        var21.setColor(16777215);
                        var21.drawImage(
                           var18.B,
                           (var18.e >> 1) - (var18.B.getWidth() >> 1),
                           (var18.b - (var18.w.getHeight() - (var18.w.getHeight() >> 2)) >> 1) - (var18.B.getHeight() >> 1),
                           20
                        );
                        var18.B = null;
                     }

                     int var10 = var18.aa * var18.w.getWidth() - var18.w.getWidth();
                     int var7;
                     if (var18.C == -1) {
                        var10 = var18.bT * var18.w.getWidth() - var18.w.getWidth();
                        if (var18.aa == var18.bT) {
                           var18.aa = 0;
                           var21.setColor(8912896);
                        } else {
                           var18.aa = var18.bT;
                           var21.setColor(16711680);
                        }

                        var7 = var18.bT;
                     } else {
                        var7 = var18.C;
                        var21.setColor(16711680);
                     }

                     var21.fillRect(0, var18.b - (var18.w.getHeight() >> 1), var10, var18.w.getHeight() >> 2);
                     boolean var11 = false;
                     int var12 = var18.b - (var18.w.getHeight() >> 2);
                     var21.setClip(0, var12, var18.e, var18.w.getHeight() >> 2);
                     int var13 = var12 - (var18.w.getHeight() - (var18.w.getHeight() >> 2));

                     for (int var4 = 0; var4 < var7; var4++) {
                        if (var4 < var18.aa) {
                           var21.drawImage(var18.w, var4 * var18.w.getWidth(), var13 + (var18.w.getHeight() >> 1), 20);
                        } else {
                           var21.drawImage(var18.w, var4 * var18.w.getWidth(), var13, 20);
                        }
                     }

                     int var14 = var18.b - (var18.w.getHeight() - (var18.w.getHeight() >> 2));
                     var21.setClip(0, var14, var18.e, var18.w.getHeight() >> 2);
                     int var15 = var14 - (var18.w.getHeight() >> 1);

                     for (int var22 = 0; var22 < var7; var22++) {
                        if (var22 < var18.aa) {
                           var21.drawImage(var18.w, var22 * var18.w.getWidth(), var15 + (var18.w.getHeight() >> 1), 20);
                        } else {
                           var21.drawImage(var18.w, var22 * var18.w.getWidth(), var15, 20);
                        }
                     }

                     int var16 = var18.C == -1 ? 3 : 5;
                     var21.setColor(0);
                     int var8 = var18.s.a(var18.Z[var16]);
                     var21.setClip(0, 0, var18.e, var18.b);
                     var21.fillRect(0, var18.b - var18.w.getHeight() - var18.s.a(), var18.e, var18.s.a());
                     var18.s.a(var21, var18.Z[var16], var18.f - (var8 >> 1), var18.b - var18.w.getHeight() - var18.s.a(), 20);
                     if (var18.C == -1) {
                        var18.s
                           .a(
                              var21,
                              "100%",
                              var18.f - (var18.s.a("100%") >> 1),
                              var18.b - (var18.w.getHeight() >> 1) + (var18.w.getHeight() >> 3) - (var18.s.a() >> 1),
                              20
                           );
                     } else {
                        int var9;
                        if ((var9 = var18.aa * 100 / 9) > 100) {
                           var9 = 100;
                        }

                        var18.s
                           .a(
                              var21,
                              var9 + "%",
                              var18.f - (var18.s.a(var9 + "%") >> 1),
                              var18.b - (var18.w.getHeight() >> 1) + (var18.w.getHeight() >> 3) - (var18.s.a() >> 1),
                              20
                           );
                     }
                  }
               }
            } else if (J) {
               if (this.K == 1) {
                  Graphics var20 = var1;
                  e var17 = this;
                  this.a(var20, var17.cf, var17.cg);
                  var17.a(var20);
                  var17.d(var20);
                  var17.b(var20);
                  var17.c(var20);
                  var20.setClip(0, 0, var17.e, var17.b);
                  a(var1, 0, 0, this.e, this.b, 0, 100);
               }

               this.bW.a(var1, this.K);
            } else {
               this.a(var1, this.cf, this.cg);
               this.a(var1);
               this.d(var1);
               this.b(var1);
               this.c(var1);
               if (this.bi) {
                  Graphics var3 = var1;
                  e var2 = this;
                  this.a(var3, 18, 0, 0);
                  var2.a(var3, var2.h[2][18] - 1, 0, 2967296, 1516544, 3, false);
                  var2.a(var3, var2.f + var2.h[2][17] - 1, var2.b - var2.bf - 6, 2967296, 1516544, 3, false);
                  var2.a(var3, var2.f - var2.h[2][17], var2.b - var2.bf - 6, 2967296, 1516544, 3, true);
                  var2.a(var3, 17, var2.f - var2.h[2][17], var2.b - var2.h[3][17]);
                  var2.a(var3, 21 + var2.ab[var2.bj][8], var2.f, var2.b - var2.h[3][17]);
                  var2.cl = "";
                  var2.cl = "" + var2.ab[var2.bj][6];
                  if (var2.bA[3] == 0 || var2.aV == 1) {
                     var2.a(
                        var3,
                        var2.cl,
                        var2.h[2][18] + (var2.h[2][12] >> 1) - (var2.cl.length() * (var2.h[2][2] + 1) >> 1),
                        (var2.h[3][12] >> 1) - (var2.h[3][1] >> 1)
                     );
                  }

                  var2.cl = "" + var2.ab[var2.bj][5];
                  if (var2.bA[2] == 0 || var2.aV == 1) {
                     var2.a(
                        var3,
                        var2.cl,
                        var2.f - var2.h[2][17] - (var2.h[2][12] >> 1) - (var2.cl.length() * (var2.h[2][2] + 1) >> 1),
                        var2.b - (var2.h[3][12] >> 1) - (var2.h[3][1] >> 1) - 1
                     );
                  }

                  var2.cl = "" + var2.cx[var2.bj][var2.ab[var2.bj][8]];
                  var2.a(
                     var3,
                     var2.cl,
                     var2.f + var2.h[2][21] + (var2.h[2][12] >> 1) - (var2.cl.length() * (var2.h[2][2] + 1) >> 1),
                     var2.b - (var2.h[3][12] >> 1) - (var2.h[3][1] >> 1) - 1
                  );
                  if (var2.aq[var2.bj] > 0) {
                     var2.b(var3, 76, var2.f - (var2.aO[76][2] >> 1), var2.s.a());
                  }

                  if (var2.t == 3) {
                     var2.a(var3, var2.e, 0, 16711680, 10354688, 2, true);
                     var2.a(var3, var2.e, 0, 34047, 3967, -2, true);
                     var2.cl = "" + var2.cm[1];
                     if (var2.bA[1] == 0 || var2.aV == 1) {
                        var2.a(
                           var3, var2.cl, var2.e - (var2.h[2][12] >> 1) + (var2.cl.length() * var2.h[2][2] >> 1), (var2.h[3][12] >> 1) - (var2.h[3][1] >> 1)
                        );
                     }

                     var2.cl = "" + var2.cm[0];
                     if (var2.bA[0] == 0 || var2.aV == 1) {
                        var2.a(var3, var2.cl, var2.e - var2.h[2][12] - (var2.cl.length() * var2.h[2][2] >> 1), (var2.h[3][12] >> 1) - (var2.h[3][1] >> 1));
                     }
                  }

                  var2.cl = var2.au + ":" + (var2.cp < 10000L ? "0" : "") + var2.cp / 1000L;
                  var2.s.a(var3, var2.cl, var2.f - (var2.s.a(var2.cl) >> 1), 0, 20);
               }

               if (this.aK) {
                  this.s.a(var1, this.cG + "", 0, this.c, 20);
                  this.s.a(var1, this.cH + "", 0, this.c + this.s.a(), 20);
                  this.s.a(var1, this.ct + "", 0, this.c + (this.s.a() << 1), 20);
               }

               if (this.t == 3 && this.aV > 0) {
                  if (this.aU[0][2] != -1) {
                     this.b(var1, this.ao + this.aV, this.e - (this.h[2][13] << 1) + (this.h[2][13] >> 1) - (this.aO[100][2] >> 1), this.h[3][13] + 2);
                  }

                  if (this.aU[1][2] != -1) {
                     this.b(var1, this.ao + this.aV - 4, this.e - this.h[2][13] + (this.h[2][13] >> 1) - (this.aO[100][2] >> 1), this.h[3][13] + 2);
                  }
               }

               if (this.cM > 0) {
                  var1.setColor(16711680);
                  var1.fillRect(0, this.h[3][12] + (this.s.a() >> 1), this.e, this.s.a());
                  this.s.a(var1, this.Z[4] + this.as, this.f - (this.s.a(this.Z[4] + this.as) >> 1), this.h[3][12] + (this.s.a() >> 1), 20);
               }
            }
         }
      } catch (Exception var6) {
      }
   }

   private void u() {
      for (int var1 = 0; var1 < this.I; var1++) {
         if (this.ab[var1][12] == 1) {
            this.O[var1 << 1] = (byte)(this.O[var1 << 1] + this.cn);
            this.cn++;
         }
      }
   }

   private final void h(int var1) {
      this.aQ[var1] = 0;
      this.af[var1][0] = 0;
      this.az[var1][0] = -1;
      this.ab[var1][27] = 99;

      for (byte var2 = 0; var2 < this.bD; var2++) {
         this.cw[var1][var2] = 0;
         this.cx[var1][var2] = 0;
         if (var2 == 0) {
            this.cw[var1][var2] = 1;
            this.cx[var1][var2] = 1;
         } else if (var2 == 1) {
            this.cw[var1][var2] = 1;
            this.cx[var1][var2] = 100;
         } else if (var1 == this.Y && this.aK) {
            if (var2 == 2) {
               this.cw[var1][var2] = 1;
               this.cx[var1][var2] = 100;
            } else if (var2 == 3) {
               this.cw[var1][var2] = 1;
               this.cx[var1][var2] = 10;
            } else if (var2 == 4) {
               this.cw[var1][var2] = 1;
               this.cx[var1][var2] = 15;
            } else if (var2 == 5) {
               this.cw[var1][var2] = 1;
               this.cx[var1][var2] = 10;
            }
         }
      }

      this.ab[var1][8] = 1;
      this.ab[var1][14]++;
      if (this.t != 1 && this.t != 3) {
         if (this.bN - 1 < this.ab[var1][14]) {
            this.ab[var1][14] = 0;
         }

         this.ab[var1][0] = this.ck[this.ab[var1][14] << 1] << 4;
         this.ab[var1][1] = this.ck[(this.ab[var1][14] << 1) + 1] << 4;
      } else {
         if (this.cu[var1] == 0) {
            if (this.bP - 1 < this.ab[var1][14]) {
               this.ab[var1][14] = 0;
            }

            this.ab[var1][0] = this.cj[this.ab[var1][14] << 1] << 4;
            this.ab[var1][1] = this.cj[(this.ab[var1][14] << 1) + 1] << 4;
         }

         if (this.cu[var1] == 1) {
            if (this.bO - 1 < this.ab[var1][14]) {
               this.ab[var1][14] = 0;
            }

            this.ab[var1][0] = this.ci[this.ab[var1][14] << 1] << 4;
            this.ab[var1][1] = this.ci[(this.ab[var1][14] << 1) + 1] << 4;
         }
      }

      this.ab[var1][25] = 65280;
      this.ab[var1][5] = this.ab[var1][23];
      this.ab[var1][6] = 0;
      this.ab[var1][24] = this.ab[var1][5] * this.ab[var1][9] * this.aP[var1] >> 16;
      this.ab[var1][12] = 1;
      this.ab[var1][21] = 0;
      if (this.Y == var1) {
         this.cf = this.ab[this.Y][0] - this.av;
         this.cg = this.ab[this.Y][1] - (this.b - this.ab[this.Y][10]);
      }

      this.a(this.ab[var1][0], this.ab[var1][1] + this.bh, (byte)(this.ab[var1][20] > 0 ? 8 : 9));
   }

   public final void d() {
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
      if (this.L) {
         this.Y = 0;
      } else {
         this.Y = (byte)(this.I - 1);
      }

      this.cm[0] = 0;
      this.cm[1] = 0;
      int var1 = 0;
      int var2 = 0;
      if (this.t != 3 && this.t != 1) {
         this.bN = (byte)(this.ck.length >> 1);
         var1 = this.c((int)this.bN);

         for (int var8 = 0; var8 < this.I; var8++) {
            this.U[var8] = (byte)var8;
            this.af[var8][0] = 0;
            this.af[var8][3] = 1;
            if (var8 + var1 > this.bN - 1) {
               this.ab[var8][14] = var8 + var1 - this.bN;
            } else {
               this.ab[var8][14] = var8 + var1;
            }
         }
      } else {
         this.bP = (byte)(this.cj.length >> 1);
         this.bO = (byte)(this.ci.length >> 1);
         var1 = this.c((int)this.bP);
         var2 = this.c((int)this.bO);

         for (int var3 = 0; var3 < this.I; var3++) {
            this.U[var3] = (byte)var3;
            this.af[var3][0] = 0;
            this.af[var3][3] = 1;
            if (this.cu[var3] == 0) {
               if (var3 + var1 > this.bP - 1) {
                  this.ab[var3][14] = var3 + var1 - this.bP;
               } else {
                  this.ab[var3][14] = var3 + var1;
               }
            }

            if (this.cu[var3] == 1) {
               if (var3 + var2 > this.bO - 1) {
                  this.ab[var3][14] = var3 + var2 - this.bO;
               } else {
                  this.ab[var3][14] = var3 + var2;
               }
            }
         }
      }

      this.ad = new int[this.I][2];
      this.az = new byte[this.I][2];

      for (int var9 = 0; var9 < this.I; var9++) {
         this.az[var9][0] = -1;
         this.az[var9][1] = -1;
      }

      this.cU = new short[this.I << 1];
      this.aT = new byte[this.I];
      this.aS = new byte[this.I];

      for (this.bj = 0; this.bj < this.I; this.bj++) {
         this.h(this.bj);
      }

      for (int var6 = 0; var6 < this.ay; var6++) {
         this.cd[var6][5] = 0;
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

   private final void c(byte var1) {
      if (var1 != 1) {
         J = !J;
         this.d = !this.d;
         this.e();
         this.K = 22;
      } else {
         J = !J;
         this.d = !this.d;
         e var8 = this;
         int var6;
         int[] var7 = new int[var6 = this.O.length >> 1];

         for (int var2 = 0; var2 < var6; var2++) {
            var7[var2] = var8.O[(var2 << 1) + 1];
            var8.U[var2] = (byte)var2;
         }

         for (int var9 = 1; var9 < var6; var9++) {
            int var4 = var7[var9];
            byte var5 = var8.U[var9];

            int var3;
            for (var3 = var9; var3 > 0 && var7[var3 - 1] > var4; var3--) {
               var7[var3] = var7[var3 - 1];
               var8.U[var3] = var8.U[var3 - 1];
            }

            var7[var3] = var4;
            var8.U[var3] = (byte)var5;
         }

         this.K = 22;
      }
   }

   final void a(Graphics var1, int var2, int var3, int var4) {
      var1.setClip(var3, var4, this.h[2][var2], this.h[3][var2]);
      var1.drawImage(this.cb[this.h[this.bv - 1][var2]], var3 - this.h[0][var2], var4 - this.h[1][var2], 20);
      var1.setClip(0, 0, this.e, this.b);
   }

   private final void a(Graphics var1, int var2, int var3, int var4, byte var5) {
      if (this.aO[var2][4] != 0) {
         if (var5 == 1) {
            var3 += this.aO[var2][4];
         } else {
            var3 += this.aO[var2][4] * var5 - this.aO[var2][2];
         }
      }

      var4 += this.aO[var2][5];
      var1.setClip(var3, var4, this.aO[var2][2], this.aO[var2][3]);
      if (var5 == -1) {
         var1.drawImage(
            this.cc[this.aO[var2][this.bx - 1] + this.bs],
            var3 - this.cc[this.aO[var2][this.bx - 1]].getWidth() + this.aO[var2][2] + this.aO[var2][0],
            var4 - this.aO[var2][1],
            20
         );
      } else {
         var1.drawImage(this.cc[this.aO[var2][this.bx - 1]], var3 - this.aO[var2][0], var4 - this.aO[var2][1], 20);
      }
   }

   private final void b(Graphics var1, int var2, int var3, int var4) {
      var3 += this.aO[var2][4];
      var4 += this.aO[var2][5];
      var1.setClip(var3, var4, this.aO[var2][2], this.aO[var2][3]);
      var1.drawImage(this.cc[this.aO[var2][this.bx - 1]], var3 - this.aO[var2][0], var4 - this.aO[var2][1], 20);
   }

   static final byte[] b(int var0) {
      if (var0 < 0) {
         var0 += 65536;
      }

      byte[] var1 = new byte[2];
      int var2 = var0 / 256;
      var0 -= var2 * 256;
      var1[0] = d(var2);
      var1[1] = d(var0);
      return var1;
   }

   static final int a(byte var0, byte var1) {
      if ((var0 = 256 * a((byte)var0) + a(var1)) > 32767) {
         var0 -= 65536;
      }

      return var0;
   }

   public final void run() {
      this.bd = false;
      e var3 = this;

      label1138: {
         try {
            var3.bz = null;
            boolean var11 = true;
            String var12 = "lz";

            while (var11) {
               try {
                  byte[] var13 = b.d.a(var12, 3);
                  byte var10003 = var13[0];
                  byte var2 = var13[1];
                  byte var14 = var10003;
                  var13 = b.d.a(var12, 3 + 256 * a(var14) + a(var2), var13[2] - 3);
                  var3.bz = Image.createImage(var13, 3, var13.length - 3);
                  var11 = false;
               } catch (Exception var21) {
                  if (var12.length() < 3) {
                     var12 = var12 + "a";
                  }
               }
            }

            var3.aA = 16777215;
            var3.l();
            Thread.sleep(2500L);
         } catch (Exception var22) {
            var3.j = false;
            break label1138;
         }

         try {
            var3.bz = null;
            boolean var101 = true;
            String var109 = "/or.png";

            while (var101) {
               try {
                  var3.bz = Image.createImage(var109);
                  var101 = false;
               } catch (Exception var17) {
                  var101 = false;
               }
            }

            var3.aA = 16777215;
            var3.l();
            Thread.sleep(2500L);
         } catch (Exception var20) {
         }

         var3.bz = null;
         var3.aA = -1;
      }

      b.b = true;
      b.a();
      ac = true;
      if (b.a[2] < 1) {
         ac = false;
      }

      n = b.a[5];
      this.q();
      byte var1 = 0;
      boolean var23 = false;

      while (this.j) {
         while (this.j) {
            try {
               Thread.sleep(this.cv + 7L);
            } catch (Exception var16) {
            }

            this.cv = 0L;
            var23 = false;
            if (this.bm != 0) {
               if (this.bk || this.bl) {
                  var3 = this;
                  e var102 = this;
                  this.bo = true;
                  if (var102.K == 12) {
                     if (var102.i.length() > 15) {
                        var102.i = "";
                     }

                     if (var102.bn == 35) {
                        var102.i = var102.i + '#';
                     }

                     if (var102.bn == 56) {
                        var102.i = var102.i + '8';
                     }

                     if (var102.bn == 53) {
                        var102.i = var102.i + '5';
                     }

                     if (var102.i.length() == 3 && var102.i.charAt(0) == '#' && var102.i.charAt(1) == '8' && var102.i.charAt(2) == '5') {
                        var102.aK = true;
                     }
                  }

                  boolean var110 = false;
                  boolean var115 = false;
                  boolean var118 = false;
                  var23 = false;
                  boolean var4 = false;
                  switch (var102.bm) {
                     case 49:
                     case 51:
                     case 55:
                     case 57:
                     default:
                        break;
                     case 50:
                        var118 = true;
                        break;
                     case 52:
                        var110 = true;
                        break;
                     case 53:
                        var4 = true;
                        break;
                     case 54:
                        var115 = true;
                        break;
                     case 56:
                        var23 = true;
                  }

                  if (var102.A) {
                     if (!var102.Q && var102.C == -1) {
                        var102.aa = 0;
                        var102.C = 0;
                        var102.A = false;
                        var102.d = !var102.d;
                        if (var102.S) {
                           var102.d();
                        } else {
                           var102.S = true;
                        }
                     }
                  } else if (var102.bm == 35 && var102.K == 1 && !var102.d) {
                     J = !J;
                     var102.d = !var102.d;
                  } else {
                     if (var102.bm == 42 && var102.aK && !J) {
                        var102.d = !var102.d;
                     }

                     if (var102.bm == 48 && !J) {
                        var102.t();
                     }

                     if (!J) {
                        if (!var102.d) {
                           if (var102.ab[var102.bj][12] == 1) {
                              if (var118) {
                                 var102.g();
                              }

                              if (var23) {
                                 var102.aI = true;
                                 if (var102.ab[var102.Y][11] == 0) {
                                    var102.az[0][0] = 3;
                                    var102.az[0][1] = -1;
                                 }
                              }

                              if (var110) {
                                 var102.h();
                              }

                              if (var115) {
                                 var102.k();
                              }

                              if (var4) {
                                 var102.cq[var102.bj] = 1;
                              }
                           } else if (var102.t == 4 && var4) {
                              var102.u();
                              var102.s();
                           }
                        } else {
                           if (var118) {
                              var102.cg -= 10;
                              if (var102.cg < 0) {
                                 var102.cg = 0;
                              }
                           }

                           if (var23) {
                              var102.cg += 10;
                              if (var102.cg > var102.bM) {
                                 var102.cg = var102.bM;
                              }
                           }

                           if (var110) {
                              var102.cf -= 10;
                              if (var102.cf < 0) {
                                 var102.cf = 0;
                              }
                           }

                           if (var115) {
                              var102.cf += 10;
                              if (var102.cf > var102.bL) {
                                 var102.cf = var102.bL;
                              }
                           }

                           if (var4) {
                              var102.d = !var102.d;
                           }
                        }
                     } else {
                        if (var118) {
                           var102.bW.b();
                        }

                        if (var23) {
                           var102.bW.a();
                        }

                        if (var110) {
                           c var5 = var102.bW;
                           if (!var102.bW.d) {
                              if (var5.b.K != 4 && var5.b.K != 19) {
                                 label739:
                                 switch (var5.b.K) {
                                    case 6:
                                       var5.c = 2;
                                       switch (var5.a) {
                                          case 0:
                                             if (var5.b.F > 0) {
                                                var5.b.F -= 5;
                                             }
                                             break label739;
                                          case 1:
                                             if (var5.b.H > 0) {
                                                var5.b.H -= 5;
                                             }
                                             break label739;
                                          case 2:
                                             if (var5.b.I > 2) {
                                                var5.b.I = (byte)(var5.b.I - 2);
                                             }

                                             var5.b.g[0] = var5.b.I >> 1;
                                             var5.b.g[1] = var5.b.I >> 1;
                                             break label739;
                                          case 3:
                                             if (var5.b.g[1] > 1) {
                                                var5.b.g[0]++;
                                                var5.b.g[1]--;
                                             }
                                          default:
                                             break label739;
                                       }
                                    case 7:
                                       var5.c = 2;
                                       switch (var5.a) {
                                          case 0:
                                             if (var5.b.F > 0) {
                                                var5.b.F -= 5;
                                             }
                                             break label739;
                                          case 1:
                                             if (var5.b.H > 0) {
                                                var5.b.H -= 5;
                                             }
                                             break label739;
                                          case 2:
                                             if (var5.b.I > 2) {
                                                var5.b.I = (byte)(var5.b.I - 2);
                                             }

                                             var5.b.g[0] = var5.b.I >> 1;
                                             var5.b.g[1] = var5.b.I >> 1;
                                             break label739;
                                          case 3:
                                             if (var5.b.g[1] > 1) {
                                                var5.b.g[0]++;
                                                var5.b.g[1]--;
                                             }
                                          default:
                                             break label739;
                                       }
                                    case 8:
                                       var5.c = 2;
                                       switch (var5.a) {
                                          case 0:
                                             if (var5.b.D > 0) {
                                                var5.b.D -= 5;
                                             }
                                             break label739;
                                          case 1:
                                             if (var5.b.H > 0) {
                                                var5.b.H -= 5;
                                             }
                                             break label739;
                                          case 2:
                                             if (var5.b.I > 2) {
                                                var5.b.I = (byte)(var5.b.I - 2);
                                             }

                                             var5.b.g[0] = var5.b.I >> 1;
                                             var5.b.g[1] = var5.b.I >> 1;
                                             break label739;
                                          case 3:
                                             if (var5.b.g[1] > 1) {
                                                var5.b.g[0]++;
                                                var5.b.g[1]--;
                                             }
                                          default:
                                             break label739;
                                       }
                                    case 9:
                                       var5.c = 2;
                                       switch (var5.a) {
                                          case 0:
                                             if (var5.b.E > 0) {
                                                var5.b.E -= 5;
                                             }
                                             break label739;
                                          case 1:
                                             if (var5.b.H > 0) {
                                                var5.b.H -= 5;
                                             }
                                             break label739;
                                          case 2:
                                             if (var5.b.I > 2) {
                                                var5.b.I = (byte)(var5.b.I - 2);
                                             }

                                             var5.b.g[0] = var5.b.I >> 1;
                                             var5.b.g[1] = var5.b.I >> 1;
                                             break label739;
                                          case 3:
                                             if (var5.b.g[1] > 1) {
                                                var5.b.g[0]++;
                                                var5.b.g[1]--;
                                             }
                                          default:
                                             break label739;
                                       }
                                    case 10:
                                       var5.c = 2;
                                       switch (var5.a) {
                                          case 0:
                                             if (var5.b.G > 0) {
                                                var5.b.G -= 5;
                                             }
                                             break;
                                          case 1:
                                             if (var5.b.H > 0) {
                                                var5.b.H -= 5;
                                             }
                                             break;
                                          case 2:
                                             if (var5.b.I > 2) {
                                                var5.b.I = (byte)(var5.b.I - 2);
                                             }

                                             var5.b.g[0] = var5.b.I >> 1;
                                             var5.b.g[1] = var5.b.I >> 1;
                                             break;
                                          case 3:
                                             if (var5.b.g[1] > 1) {
                                                var5.b.g[0]++;
                                                var5.b.g[1]--;
                                             }
                                       }
                                 }
                              } else {
                                 var5.b();
                              }
                           }
                        }

                        if (var115) {
                           c var48 = var102.bW;
                           if (!var102.bW.d) {
                              if (var48.b.K != 4 && var48.b.K != 19) {
                                 label702:
                                 switch (var48.b.K) {
                                    case 6:
                                       var48.c = 1;
                                       switch (var48.a) {
                                          case 0:
                                             if (var48.b.F < 100) {
                                                var48.b.F += 5;
                                             }
                                             break label702;
                                          case 1:
                                             if (var48.b.H < 100) {
                                                var48.b.H += 5;
                                             }
                                             break label702;
                                          case 2:
                                             if (var48.b.I < 20) {
                                                var48.b.I = (byte)(var48.b.I + 2);
                                             }

                                             var48.b.g[0] = var48.b.I >> 1;
                                             var48.b.g[1] = var48.b.I >> 1;
                                             break label702;
                                          case 3:
                                             if (var48.b.g[0] > 1) {
                                                var48.b.g[1]++;
                                                var48.b.g[0]--;
                                             }
                                          default:
                                             break label702;
                                       }
                                    case 7:
                                       var48.c = 1;
                                       switch (var48.a) {
                                          case 0:
                                             if (var48.b.F < 100) {
                                                var48.b.F += 5;
                                             }
                                             break label702;
                                          case 1:
                                             if (var48.b.H < 100) {
                                                var48.b.H += 5;
                                             }
                                             break label702;
                                          case 2:
                                             if (var48.b.I < 20) {
                                                var48.b.I = (byte)(var48.b.I + 2);
                                             }

                                             var48.b.g[0] = var48.b.I >> 1;
                                             var48.b.g[1] = var48.b.I >> 1;
                                             break label702;
                                          case 3:
                                             if (var48.b.g[0] > 1) {
                                                var48.b.g[1]++;
                                                var48.b.g[0]--;
                                             }
                                          default:
                                             break label702;
                                       }
                                    case 8:
                                       var48.c = 1;
                                       switch (var48.a) {
                                          case 0:
                                             if (var48.b.D < 100) {
                                                var48.b.D += 5;
                                             }
                                             break label702;
                                          case 1:
                                             if (var48.b.H < 100) {
                                                var48.b.H += 5;
                                             }
                                             break label702;
                                          case 2:
                                             if (var48.b.I < 20) {
                                                var48.b.I = (byte)(var48.b.I + 2);
                                             }

                                             var48.b.g[0] = var48.b.I >> 1;
                                             var48.b.g[1] = var48.b.I >> 1;
                                             break label702;
                                          case 3:
                                             if (var48.b.g[0] > 1) {
                                                var48.b.g[1]++;
                                                var48.b.g[0]--;
                                             }
                                          default:
                                             break label702;
                                       }
                                    case 9:
                                       var48.c = 1;
                                       switch (var48.a) {
                                          case 0:
                                             if (var48.b.E < 100) {
                                                var48.b.E += 5;
                                             }
                                             break label702;
                                          case 1:
                                             if (var48.b.H < 100) {
                                                var48.b.H += 5;
                                             }
                                             break label702;
                                          case 2:
                                             if (var48.b.I < 20) {
                                                var48.b.I = (byte)(var48.b.I + 2);
                                             }

                                             var48.b.g[0] = var48.b.I >> 1;
                                             var48.b.g[1] = var48.b.I >> 1;
                                             break label702;
                                          case 3:
                                             if (var48.b.g[0] > 1) {
                                                var48.b.g[1]++;
                                                var48.b.g[0]--;
                                             }
                                          default:
                                             break label702;
                                       }
                                    case 10:
                                       var48.c = 1;
                                       switch (var48.a) {
                                          case 0:
                                             if (var48.b.G < 100) {
                                                var48.b.G += 5;
                                             }
                                             break;
                                          case 1:
                                             if (var48.b.H < 100) {
                                                var48.b.H += 5;
                                             }
                                             break;
                                          case 2:
                                             if (var48.b.I < 20) {
                                                var48.b.I = (byte)(var48.b.I + 2);
                                             }

                                             var48.b.g[0] = var48.b.I >> 1;
                                             var48.b.g[1] = var48.b.I >> 1;
                                             break;
                                          case 3:
                                             if (var48.b.g[0] > 1) {
                                                var48.b.g[1]++;
                                                var48.b.g[0]--;
                                             }
                                       }
                                 }
                              } else {
                                 var48.a();
                              }
                           }
                        }

                        if (var4) {
                           var102.bW.b(false);
                        }

                        if (var102.bm == 35) {
                           var102.bW.a(false);
                        }
                     }
                  }

                  if (var3.bp) {
                     var3.bm = 0;
                     var3.bp = false;
                  }

                  this.bk = false;
               }

               var23 = true;
            }

            if (this.A) {
               var3 = this;
               if (this.Q) {
                  if (var3.aL) {
                     long var108 = System.currentTimeMillis();
                     e var33 = var3;
                     var3.cR = null;
                     var33.bX = null;
                     var33.aH = null;
                     var33.aO = null;
                     var33.aJ = null;
                     var33.cO = null;
                     var33.cP = null;
                     var33.ab = null;
                     var33.aq = null;
                     var33.aQ = null;
                     var33.cC = null;
                     var33.cr = null;
                     var33.aM = null;
                     var33.cJ = null;
                     var33.O = null;
                     var33.cx = null;
                     var33.ch = null;
                     var33.cw = null;
                     var33.af = null;
                     var33.cq = null;
                     var33.U = null;
                     var33.cu = null;
                     var33.ab = null;
                     var33.aP = null;
                     var33.ck = null;
                     var33.cj = null;
                     var33.ci = null;
                     var33.ck = null;
                     var33.ad = null;
                     e var34 = var3;
                     var3.aC = null;
                     var34.cc = null;
                     var34.ca = null;
                     var34.aB = null;
                     long var117;
                     if ((var117 = System.currentTimeMillis()) - var108 < 1000L) {
                        try {
                           Thread.sleep(1000L - (var117 - var108));
                        } catch (Exception var18) {
                        }
                     }

                     a(u, true);
                     var3.aL = false;
                     var3.Q = false;
                     var3.A = false;
                  } else {
                     var3.aL = true;
                  }
               } else if (var3.C != -1) {
                  if (var3.R) {
                     if (var3.aa == 2) {
                        var3.f(1);
                     }
                  } else {
                     switch (var3.aa) {
                        case 1:
                           e var32 = var3;
                           byte[] var47;
                           int var58 = (var47 = b.d.a("cu2", -1)).length / var32.bx;
                           var32.aO = new short[var58][var32.bx];

                           for (int var66 = 1; var66 < var58; var66++) {
                              int var86 = var66 * var32.bx;

                              for (int var76 = 0; var76 < var32.bx; var76++) {
                                 var32.aO[var66][var76] = var47[var86 + var76];
                              }
                           }
                           break;
                        case 2:
                           int var45 = var3.T;
                           e var31 = var3;
                           byte[] var62;
                           int var72;
                           byte[][] var56 = new byte[var72 = (var62 = b.d.a("obj0", -1)).length / (var31.bJ * var31.bK)][var31.bJ * var31.bK];
                           int var79 = 0;

                           for (int var90 = 0; var90 < var72; var90++) {
                              for (int var99 = 0; var99 < var31.bC; var99++) {
                                 var56[var90][var99] = var62[var79];
                                 if (var56[var90][var99] < 0) {
                                    var56[var90][var99] = (byte)(var56[var90][var99] + 256);
                                 }

                                 var79++;
                              }
                           }

                           int var100 = -1;
                           var72 = (var62 = b.d.a("ll", -1)).length;
                           if (var45 == 0) {
                              var100 = 0;
                           } else {
                              byte var80 = 0;
                              byte var91 = 0;

                              for (byte var103 = 9; var103 < var72; var103 += 3) {
                                 if (var62[var103] == 0 && var62[var103 + 1] == 0 && var62[var103 + 2] == 0) {
                                    var80++;
                                 }

                                 if (var80 == 4) {
                                    if (var45 == ++var91) {
                                       var100 = var103 + 3;
                                       break;
                                    }

                                    var103 += 9;
                                    var80 = 0;
                                 }
                              }
                           }

                           var31.bH = var62[var100];
                           var31.bI = var62[var100 + 1];
                           if (var31.bH < 0) {
                              var31.bH += 256;
                           }

                           if (var31.bI < 0) {
                              var31.bI += 256;
                           }

                           var31.bL = (var31.bH << 4) - var31.e;
                           var31.bM = (var31.bI << 4) - var31.b;
                           var31.bU = var31.bL + var31.e - 32;
                           var31.cR = new byte[var31.bH][var31.bI];
                           var79 = 0;
                           var31.ay = 0;

                           for (int var92 = var100 + 9; var92 < var72; var92 += 3) {
                              if (var62[var92] == 0 && var62[var92 + 1] == 0 && var62[var92 + 2] == 0) {
                                 var79 = var92 + 3;
                                 break;
                              }

                              var31.ay++;
                           }

                           var31.cd = new int[var31.ay][6];
                           var31.ay *= 3;
                           int var104 = 0;

                           for (int var93 = var100 + 9; var93 < var31.ay + var100 + 9; var93 += 3) {
                              var31.cd[var104][0] = var62[var93];
                              if (var31.cd[var104][0] < 0) {
                                 var31.cd[var104][0] = var31.cd[var104][0] + 256;
                              }

                              var31.cd[var104][1] = var62[var93 + 1] + 1;
                              if (var31.cd[var104][1] < 0) {
                                 var31.cd[var104][1] = var31.cd[var104][1] + 256;
                              }

                              var31.cd[var104][2] = (var31.cd[var104][0] << 4) + (16 - var31.aO[var62[var93 + 2] - 31][2] >> 1);
                              var31.cd[var104][3] = var31.cd[var104][1] << 4;
                              var31.cd[var104][4] = var62[var93 + 2] - 100;
                              if (var31.cd[var104][4] < 0) {
                                 var31.cd[var104][4] = var31.cd[var104][4] + 256;
                              }

                              var31.cd[var104][5] = 0;
                              var104++;
                           }

                           var31.ay /= 3;

                           for (int var94 = var79; var94 < var79 + 15; var94 += 3) {
                              if (var62[var94 + 2] == -7) {
                                 var31.aU[0][0] = 16 * var62[var94];
                                 var31.aU[0][1] = 16 * var62[var94 + 1];
                              }

                              if (var62[var94 + 2] == -6) {
                                 var31.aU[1][0] = 16 * var62[var94];
                                 var31.aU[1][1] = 16 * var62[var94 + 1];
                              }

                              if (var62[var94 + 2] == -5) {
                                 var31.aW[0][0] = 16 * var62[var94];
                                 var31.aW[0][1] = 16 * var62[var94 + 1];
                              }

                              if (var62[var94 + 2] == -4) {
                                 var31.aW[1][0] = 16 * var62[var94];
                                 var31.aW[1][1] = 16 * var62[var94 + 1];
                              }
                           }

                           var31.aU[0][2] = -1;
                           var31.aU[1][2] = -1;
                           var79 += 15;
                           int var95 = 0;
                           int var105 = 0;
                           byte var111 = 0;
                           int var116 = 0;
                           int var119 = 0;

                           for (int var15 = var79; var15 < var72 && (var62[var15] != 0 || var62[var15 + 1] != 0 || var62[var15 + 2] != 0); var15 += 3) {
                              if (var31.t != 3 && var31.t != 1) {
                                 var95++;
                              } else {
                                 switch (var62[var15 + 2]) {
                                    case -3:
                                       var116++;
                                       break;
                                    case -2:
                                       var119++;
                                 }
                              }
                           }

                           if (var31.t != 3 && var31.t != 1) {
                              var31.bN = (byte)var95;
                              var31.ck = new short[var95 << 1];
                           } else {
                              var31.bP = (byte)var119;
                              var31.bO = (byte)var116;
                              var31.cj = new short[var119 << 1];
                              var31.ci = new short[var116 << 1];
                           }

                           for (int var96 = var79; var96 < var72; var96 += 3) {
                              if (var62[var96] == 0 && var62[var96 + 1] == 0 && var62[var96 + 2] == 0) {
                                 var79 = var96 + 3;
                                 break;
                              }

                              if (var31.t != 3 && var31.t != 1) {
                                 var31.ck[var105] = var62[var96];
                                 var31.ck[var105 + 1] = var62[var96 + 1];
                                 var105 += 2;
                              } else {
                                 switch (var62[var96 + 2]) {
                                    case -3:
                                       var31.ci[var111] = var62[var96];
                                       var31.ci[var111 + 1] = var62[var96 + 1];
                                       var111 += 2;
                                       break;
                                    case -2:
                                       var31.cj[var105] = var62[var96];
                                       var31.cj[var105 + 1] = var62[var96 + 1];
                                       var105 += 2;
                                 }
                              }
                           }

                           for (int var83 = var79; var83 < var72 && (var62[var83] != 0 || var62[var83 + 1] != 0 || var62[var83 + 2] != 0); var83 += 3) {
                              var95 = 0;
                              var105 = 0;

                              for (int var112 = 0; var112 < var31.bJ * var31.bK; var112++) {
                                 if (var105 == var31.bJ) {
                                    var105 = 0;
                                    var95++;
                                 }

                                 if (var62[var83] < 0) {
                                    var62[var83] = (byte)(var62[var83] + 256);
                                 }

                                 if (var62[var83 + 1] < 0) {
                                    var62[var83 + 1] = (byte)(var62[var83 + 1] + 256);
                                 }

                                 if (var62[var83 + 2] < 0) {
                                    var62[var83 + 2] = (byte)(var62[var83 + 2] + 256);
                                 }

                                 if (var62[var83] + var105 < var31.bH && var62[var83 + 1] + var95 < var31.bI && var56[var62[var83 + 2] - 1][var112] != 0) {
                                    var31.cR[var62[var83] + var105][var62[var83 + 1] + var95] = var56[var62[var83 + 2] - 1][var112];
                                 }

                                 var105++;
                              }
                           }

                           var62 = b.d.a("wlg", -1);
                           var95 = 0;
                           if (var31.cP != null) {
                              var31.cP = null;
                           }

                           var31.cP = new byte[16][6];

                           for (int var107 = 0; var107 < 16; var107++) {
                              for (int var113 = 0; var113 < 6; var113++) {
                                 var31.cP[var107][var113] = var62[var95];
                                 var95++;
                              }
                           }

                           int var57 = (var62 = b.d.a("wpn", -1)).length;
                           if (var45 == 0) {
                              var100 = 0;
                           } else {
                              var72 = 0;

                              for (byte var84 = 0; var84 < var57; var84 += 3) {
                                 if (var62[var84] == 0 && var62[var84 + 1] == 0 && var62[var84 + 2] == 0) {
                                    if (++var72 == var45) {
                                       var100 = var84 + 3;
                                       break;
                                    }
                                 }
                              }
                           }

                           if (var31.cO != null) {
                              var31.cO = null;
                           }

                           var31.cO = new byte[var31.bH][var31.bI];

                           for (int var75 = var100; var75 < var57 && (var62[var75] != 0 || var62[var75 + 1] != 0 || var62[var75 + 2] != 0); var75 += 3) {
                              byte[] var10000 = var31.cO[var62[var75]];
                              int var10001 = var62[var75 + 1] + 1;
                              var45 = var62[var75 + 2] + 256;
                              byte var85 = 0;
                              switch (var45) {
                                 case 242:
                                    var85 = 6;
                                    break;
                                 case 243:
                                    var85 = 5;
                                 case 244:
                                 default:
                                    break;
                                 case 245:
                                    var85 = 3;
                                    break;
                                 case 246:
                                    var85 = 2;
                                    break;
                                 case 247:
                                    var85 = 1;
                              }

                              var10000[var10001] = var85;
                           }

                           var31.cg = var31.bM;
                           break;
                        case 3:
                           e var30 = var3;
                           byte var88 = 0;
                           byte[] var44;
                           int var55 = (var44 = b.d.a("ca", -1)).length / var30.bw;
                           var30.aH = new short[var55][];
                           byte var10 = 1;

                           for (int var61 = 0; var61 < var55; var61++) {
                              int var78 = var61 * var30.bw;
                              var88 = 0;
                              if (var61 == 79
                                 || var61 == 90
                                 || var61 == 91
                                 || var61 == 108
                                 || var61 == 109
                                 || var61 == 110
                                 || var61 == 189
                                 || var61 == 200
                                 || var61 == 201
                                 || var61 == 207
                                 || var61 == 218
                                 || var61 == 219) {
                                 var10 = var30.bw;
                              }

                              for (byte var70 = 0; var70 < var30.bw; var70 += 3) {
                                 if (var44[var78 + var70 + 2] == 0 && var44[var78 + var70 + 1] == 0 && var44[var78 + var70] == 0) {
                                    var10 = var70;
                                    break;
                                 }
                              }

                              var30.aH[var61] = new short[var10];

                              for (int var71 = 0; var71 < var10; var71++) {
                                 var30.aH[var61][var71] = var44[var78 + var71];
                                 if (var88 == 2) {
                                    if (var30.aH[var61][var71] > 60 && 65 > var30.aH[var61][var71]) {
                                       var30.aH[var61][var71] = 0;
                                    }

                                    if (var30.aH[var61][var71] < 0) {
                                       var30.aH[var61][var71] = (short)(var30.aH[var61][var71] + 256);
                                    }
                                 }

                                 if (++var88 == 3) {
                                    var88 = 0;
                                 }
                              }
                           }
                           break;
                        case 4:
                           e var29 = var3;
                           byte[] var43;
                           int var54 = (var43 = b.d.a("mua", -1)).length / var29.by;
                           var29.bX = new short[var54][var29.by];

                           for (int var60 = 0; var60 < var54; var60++) {
                              int var77 = var60 * var29.by;

                              for (int var69 = 0; var69 < var29.by; var69++) {
                                 var29.bX[var60][var69] = var43[var77 + var69];
                                 if (var29.bX[var60][var69] < 0 && var69 == 0) {
                                    var29.bX[var60][var69] = (short)(var29.bX[var60][var69] + 256);
                                 }
                              }
                           }
                           break;
                        case 5:
                           e var28 = var3;
                           byte[] var68;
                           int var87 = (var68 = b.d.a("cc", -1)).length;
                           var28.bt = var87 / 11;
                           var28.aJ = new byte[11][var28.bt];
                           int var59 = 0;

                           for (int var53 = 0; var53 < var28.bt; var53++) {
                              for (int var42 = 0; var42 < 11; var42++) {
                                 var28.aJ[var42][var53] = var68[var59];
                                 var59++;
                              }

                              if (var28.aJ[0][var53] < 0) {
                                 var28.aJ[0][var53] = (byte)(var28.aJ[0][var53] + 256);
                              }

                              if (var28.aJ[1][var53] < 0) {
                                 var28.aJ[1][var53] = (byte)(var28.aJ[1][var53] + 256);
                              }

                              if (var28.aJ[2][var53] < 0) {
                                 var28.aJ[2][var53] = (byte)(var28.aJ[2][var53] + 256);
                              }

                              if (var28.aJ[3][var53] < 0) {
                                 var28.aJ[3][var53] = (byte)(var28.aJ[3][var53] + 256);
                              }
                           }
                           break;
                        case 6:
                           var3.r();
                           break;
                        case 7:
                           e var27 = var3;
                           var3.cu = new byte[var27.I];
                           var27.ab = new int[var27.I][28];
                           switch (var27.t) {
                              case 0:
                                 for (int var41 = 0; var41 < var27.I; var41++) {
                                    var27.cu[var41] = (byte)var41;
                                 }
                                 break;
                              case 1:
                                 for (int var52 = var27.g[0]; var52 < var27.I; var52++) {
                                    var27.cu[var52] = 1;
                                 }
                                 break;
                              case 2:
                                 for (int var6 = 0; var6 < var27.I; var6++) {
                                    var27.cu[var6] = (byte)var6;
                                 }
                                 break;
                              case 3:
                                 for (int var67 = var27.g[0]; var67 < var27.I; var67++) {
                                    var27.cu[var67] = 1;
                                 }
                                 break;
                              case 4:
                                 for (int var8 = 0; var8 < var27.I; var8++) {
                                    var27.cu[var8] = (byte)var8;
                                 }
                           }

                           var27.aP = new int[var27.I];

                           for (int var9 = 0; var9 < var27.I; var9++) {
                              var27.ab[var9][9] = var27.bX[var27.ab[var9][20]][1];
                              var27.ab[var9][10] = var27.bX[var27.ab[var9][20]][2];
                              var27.ab[var9][5] = var27.bX[var27.ab[var9][20]][5];
                              var27.ab[var9][23] = var27.bX[var27.ab[var9][20]][5];
                              var27.ab[var9][26] = var27.bX[var27.ab[var9][20]][6];
                              var27.aP[var9] = (65536 + (var27.ab[var9][23] >> 1)) / var27.ab[var9][23];
                              var27.ab[var9][24] = var27.ab[var9][5] * var27.ab[var9][9] * var27.aP[var9] >> 16;
                              var27.ab[var9][25] = 65280;
                              if (var27.ab[var9][9] - var27.ab[var9][24] >= (var27.ab[var9][9] >> 2) + (var27.ab[var9][9] >> 1)) {
                                 var27.ab[var9][25] = 16711680;
                              } else if (var27.ab[var9][9] - var27.ab[var9][24] >= var27.ab[var9][9] >> 2) {
                                 var27.ab[var9][25] = 16776960;
                              }

                              var27.ab[var9][18] = var27.bX[var27.ab[var9][20]][3];
                              var27.ab[var9][19] = var27.bX[var27.ab[var9][20]][4];
                              if (var9 < var27.g[0]) {
                                 var27.ab[var9][20] = 1;
                              }

                              var27.ab[var9][20] = var27.ab[var9][20] * 110;
                              if (var27.t == 3 && var27.cu[var9] == 0) {
                                 var27.ab[var9][4] = 1;
                              }
                           }
                           break;
                        case 8:
                           var3.f(0);
                           d.a();
                     }
                  }

                  if (var3.aa == 20) {
                     var3.C = -1;
                     var3.bT = var3.aa++;
                     var3.R = false;
                  } else {
                     var3.aa++;
                  }
               }

               this.l();
            } else {
               if (!this.d) {
                  long var36 = System.currentTimeMillis();
                  this.i();
                  long var49 = System.currentTimeMillis();
                  this.cH = var49 - var36;
               }

               if (var1 != this.K) {
                  if (var1 > 4 && var1 < 11) {
                     this.W = 77;
                  }

                  var3 = this;
                  this.bW = null;
                  if (var3.K < 11) {
                     var3.bW = new c(var3, var3.b("text"));
                  }

                  switch (var3.K) {
                     case 11:
                        var3.bW = new c(var3, var3.c("text2"));
                        break;
                     case 12:
                        var3.bW = new c(var3, var3.c("text1"));
                        break;
                     case 13:
                        var3.bW = new c(var3, var3.p());
                        break;
                     case 14:
                        var3.bW = new c(var3, var3.p());
                     case 15:
                     case 16:
                     case 17:
                     case 18:
                     case 23:
                     case 24:
                     default:
                        break;
                     case 19:
                        var3.bW = new c(var3, var3.b("text"));
                        break;
                     case 20:
                        var3.bW = new c(var3, null);
                        break;
                     case 21:
                        var3.bW = new c(var3, null);
                        break;
                     case 22:
                        var3.bW = new c(var3, null);
                        break;
                     case 25:
                        var3.bW = new c(var3, var3.cE);
                  }

                  var1 = this.K;
               }

               if (!J) {
                  long var39 = System.currentTimeMillis();
                  this.l();
                  long var51 = System.currentTimeMillis();
                  this.cp -= var51 - var39;
                  if (this.cp < 0L && this.au != 0) {
                     this.au--;
                     this.cp += 60000L;
                  }
               } else {
                  long var38 = System.currentTimeMillis();
                  this.l();
                  long var50 = System.currentTimeMillis();
                  if (var23) {
                     if (this.ce == 0L) {
                        this.ce = 300L;
                     } else {
                        this.ce = 77L;
                     }

                     if (var50 - var38 < this.ce) {
                        try {
                           long var7 = this.ce - (var50 - var38) >> 3;

                           for (int var26 = 0; var26 < var7; var26++) {
                              Thread.sleep(8L);
                              if (this.bm == 0) {
                                 break;
                              }
                           }
                        } catch (Exception var19) {
                        }
                     }

                     if (this.bm == 0) {
                        this.ce = 0L;
                     }
                  } else {
                     this.ce = 0L;
                  }
               }
            }
         }
      }

      if (ac) {
         b.a[2] = 1;
      } else {
         b.a[2] = 0;
      }

      b.a[5] = n;
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
      } catch (Exception var1) {
      }
   }

   public final void e() {
      int var5;
      int[] var6 = new int[var5 = this.O.length >> 1];

      for (int var1 = 0; var1 < var5; var1++) {
         var6[var1] = this.O[var1 << 1];
         this.U[var1] = (byte)var1;
      }

      for (int var7 = 1; var7 < var5; var7++) {
         int var3 = var6[var7];
         byte var4 = this.U[var7];

         int var2;
         for (var2 = var7; var2 > 0 && var6[var2 - 1] < var3; var2--) {
            var6[var2] = var6[var2 - 1];
            this.U[var2] = this.U[var2 - 1];
         }

         var6[var2] = var3;
         this.U[var2] = (byte)var4;
      }
   }

   private static void a(int var0, boolean var1) {
      if (var1 || var0 < u) {
         if (V) {
            if (d.a == null) {
               d.a(tr.b);
            }

            if (var1) {
               var0 = u;
            }

            d.a(var0);
         }
      }
   }

   public static void f() {
      d.a();
   }

   private final String[] b(String var1) {
      byte var5;
      if ((var5 = this.K) == 19) {
         var5 = 4;
      }

      int var3;
      String[][] var6;
      String[] var2 = new String[var3 = (var6 = b.d.b(var1))[var5].length];

      for (int var4 = 0; var4 < var3; var4++) {
         var2[var4] = var6[var5][var4];
      }

      return var2;
   }

   public final String[] a(String var1) {
      return b.a(b.d.c(var1), this.s, 10000, false);
   }

   private final String[] c(String var1) {
      return b.a(b.d.c(var1), this.s, this.e - (this.e / 13 << 1) - 1, true);
   }

   public final String[] a(String var1, int var2) {
      return b.a(var1, this.s, var2, true);
   }

   private static void v() {
      if (ac) {
         try {
            d.b();
            return;
         } catch (Exception var0) {
         }
      }
   }
}
