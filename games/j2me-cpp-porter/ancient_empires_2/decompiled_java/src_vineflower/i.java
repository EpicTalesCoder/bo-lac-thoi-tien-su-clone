import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.OutputStream;
import java.util.Vector;
import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class i extends a implements Runnable {
   public String a = "?";
   public static byte a = 32;
   public int a;
   public int b;
   public int c;
   public int d;
   public int e = 0;
   public static String[] a = new String[12];
   public static int[] a = new int[]{4, 5, 6, 7, 8, 9, 10, 11};
   public boolean[] a;
   public static final short[] a = new short[]{500, 1000, 2000};
   public static final short[] c = new short[]{10, 20, 25};
   public int f;
   public int g;
   public byte b;
   public static int h = 1024;
   public static int i = 2048;
   public String[] b = new String[]{a.a(66), a.a(70), a.a(71), a.a(4), a.a(60)};
   public String[] d = new String[]{a.a(63), a.a(67), a.a(68), a.a(62), a.a(69), a.a(61), a.a(64)};
   public h[] a = new h[this.d.length];
   public String[] e = new String[]{a.a(1), a.a(2), a.a(5), a.a(3), a.a(6), a.a(8), a.a(7), a.a(9), a.a(10), a.a(11), a.a(4)};
   public h[] b = new h[this.e.length];
   public String[] f = new String[]{a.a(35), a.a(36), a.a(37)};
   public String[] g = new String[]{a.a(29), a.a(30)};
   public byte[] a = new byte[]{0, 6, 5, 7, 8, 9};
   public byte[] b = new byte[]{0, 6, 5, 7, 8, 9};
   public byte[] c = new byte[]{1, 2, 3, 4};
   public static final byte[][] a = new byte[][]{{0, 1}, {2, 3, 4}, {0, 1}, {5}};
   public static final byte[] d = new byte[]{0};
   public long a = 0L;
   public long b;
   public static final int[][][] a = new int[][][]{
      new int[0][],
      {{150, 217, 244}, {65, 149, 233}, {0, 100, 198}, {12, 53, 112}},
      {{244, 158, 156}, {219, 36, 113}, {161, 0, 112}, {95, 5, 120}},
      {{171, 237, 90}, {99, 190, 37}, {0, 153, 55}, {0, 85, 82}},
      {{0, 118, 150}, {0, 65, 114}, {0, 43, 75}, {0, 22, 48}}
   };
   public static final int[] b = new int[]{10526880, 26054, 15204434, 39473, 16754};
   public static final int[] c = new int[]{-1, 2, 3, 2, 3};
   public static final int[] d = new int[]{-1, 4, 5, 4, 5};
   public f[][] a;
   public static final byte[] e = new byte[]{1, 2};
   public static final byte[] f = new byte[]{0, 5, 10, 10, 15, 0, 5, 15, 15, 15};
   public static final byte[] g = new byte[]{1, 1, 2, 2, 3, 3, 1, 1, 1, 1};
   public int j;
   public h[] c;
   public byte[] h;
   public int k;
   public int l;
   public int m;
   public int n;
   public int o;
   public int p;
   private h g;
   public h[] d;
   public f a;
   public f b;
   public f c;
   public f d;
   public f e;
   public f f;
   public f g;
   public f h;
   public f i;
   public f j;
   public f k;
   public f l;
   public int q;
   public int r;
   public byte[][] b;
   public byte c;
   public byte d;
   public long c;
   public int s;
   public int t;
   public int u;
   public c[] a;
   public c a;
   public int v;
   public int w;
   public byte[][] c;
   public boolean a = false;
   public boolean b = false;
   public boolean c = true;
   public Vector a = new Vector();
   public Vector b;
   public int x;
   public int y;
   public long d;
   public byte e = 2;
   public byte[] i = new byte[5];
   public byte[] j = new byte[4];
   public byte[] k = new byte[4];
   public byte f = 0;
   public short a;
   public c[] b;
   public c[][] a;
   public int[] e;
   public int[] f = new int[4];
   public byte[][] d = new byte[4][2];
   public byte[] l = new byte[4];
   public d a;
   public Vector c = new Vector();
   public Vector d = new Vector();
   public c b;
   public c c;
   public long e;
   public c d;
   public byte g;
   public long f;
   public int z;
   public boolean d = false;
   public boolean e = false;
   public byte h;
   public h a;
   public h b;
   public h c;
   public h d;
   public int A;
   public boolean f = false;
   public int B;
   public int C;
   public int D;
   public int E;
   public long g;
   public c e;
   public c f;
   public boolean g = true;
   public long h;
   public boolean h = false;
   public long i;
   public int F;
   public int G;
   public h[] e;
   public boolean i = false;
   public boolean j;
   public static int[] g = new int[]{83, 83, 83, 83, 83, 83, 83, 83, 175, 84, 84, 84, 175, 147, 159, 151, 155, 167, 171};
   public int H = -1;
   public d b;
   public d c;
   public d d;
   public d e;
   public int I = 8;
   public d f;
   public d g;
   public d h;
   public boolean k = false;
   public int J;
   public byte[][] e;
   public byte[][] f;
   public f m;
   public f n;
   public c g;
   public f o;
   public f p;
   public int K;
   public int L;
   public int M;
   public boolean l = true;
   public int N;
   public boolean m;
   public f q;
   public f[] a = new f[0];
   public f r;
   public d i;
   public d j;
   public d k;
   public d l;
   public d[] a;
   public d[] b;
   public d m;
   public d[] c;
   public f s;
   public int O;
   public boolean n;
   public boolean o;
   public boolean p;
   public Vector e = new Vector(2);
   public f t;
   public int P;
   public f[] b;
   public d n;
   public d o;
   public d p;
   public d q;
   public f u;
   public f v;
   public c h;
   public int Q = 0;
   public boolean q = true;
   public boolean r;
   public String b;
   public String[] h;
   public byte[] m;
   public int[] h;
   public d r;
   public d s;
   public d t;
   public d u;
   public d v;
   public d w;
   public d x;
   public byte i;
   public byte[] n;
   public int R;
   public String[] i;
   public int[] i;
   public String[] j = new String[]{a.a(46), a.a(47)};
   public String[] k = new String[]{a.a(48), a.a(49)};
   public d y;
   public d z;
   public d A;
   public d B;
   public d C;
   public d D;
   public d E;
   public d F;
   public int S;
   public String c;
   public int T;
   public boolean s = true;
   public boolean t = true;
   public boolean u = true;
   public h e;
   public Image[][] a;
   public int U;
   public static final String[] l = new String[]{"14281428", "18241824"};
   public StringBuffer a = new StringBuffer();
   public c i = null;
   public int V = 12;
   public int ad = 1;
   public boolean v;
   public int ae;
   public int af;
   public int ag;
   public int ah;
   public int ai;
   public h f;
   public String[] m;
   public boolean w;
   public byte j;
   public int aj;
   public int ak;
   public int al;
   public int am = 0;
   public int an;
   public int ao = 24;
   public int ap = 8;
   public int aq = this.ap >> 1;
   public int ar;
   public static final byte[] o = new byte[]{0, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3};
   public byte k = 0;
   public int as;
   public int at;
   public c j;
   public c k;
   public c l;
   public int au;
   public long j;
   public c[] c;
   public c[] d;
   public byte[] p;
   public int[][] a;
   public int[] j;
   public int av;
   public byte[][] g;
   public int aw;
   public int ax;
   public int ay;
   public int az;
   public int aA;
   public Vector f;
   public boolean x = false;
   public int aB;
   public d G;
   public c m;
   public c n;
   public c o;
   public c p;
   public c q = null;
   public c r = null;
   public int aC;
   public long k;
   public int aD;
   public boolean y = false;
   public boolean z = false;
   public int aE = -1;
   public int aF = -1;
   public int aG = 0;
   public g a;
   public g b;
   public long l;
   public boolean A;
   public Vector g = new Vector();
   public boolean B = false;
   public long m;
   public long n;
   public boolean C;
   public boolean D;
   public boolean E;
   public boolean F;
   public int aH;
   public int aI;
   public int aJ;
   public String[] n;
   public String[] o;
   public String[] p;
   public String[] q;
   public String[] r;
   public int[] k;
   public String d = "Macrospace";
   public String e = "msaeii";
   public String f = "http://msaeii.scores.macrospace.com/connectx/in";
   private ByteArrayOutputStream a;
   private DataOutputStream a;
   public int aK;
   public boolean G;
   public a a;
   public int aL;

   public i() {
      this.h = 4;
   }

   public final void b() throws Exception {
      this.a(0);
      e.b("");
      this.a(18);
      e.e();

      for (int var1 = 0; var1 < e.b.length; var1++) {
         e.d(var1);
         this.a(19 + var1);
      }

      this.a(28);
      d.a = this;
      this.a(29);
      a.d();
      this.a(30);
      e.d();
      this.a(32);
      this.a = (new f("action_icons")).a;
      this.a(34);
      this.b = (new f("menu_icons")).a;
      this.a(36);
      this.o = new f("hud_icons");
      this.a(38);
      this.p = new f("hud_icons_2");
      this.a(40);
      this.d = new f("arrow");
      this.a(42);
      this.c = new f("side_arrow");
      this.a(44);
      this.e = new f("buttons");
      this.a(46);
      this.f = new f("menu");
      this.a(48);
      this.m = new f("big_circle");
      this.a(50);
      this.n = new f("small_circle");
      this.a(52);
      this.k = new f("small_spark");
      this.a(54);
      this.s = new f("alpha");
      this.a(56);

      try {
         this.e = new h("gameover");
      } catch (Exception var15) {
      }

      this.a(58);
      this.a = new h("ms_logo");
      this.a(62);
      DataInputStream var17;
      short var2 = (var17 = new DataInputStream(e.a("tiles0.prop"))).readShort();
      var17.readShort();
      this.h = new byte[var2];

      for (int var4 = 0; var4 < var2; var4++) {
         this.h[var4] = var17.readByte();
      }

      var17.close();
      this.a(64);
      f var20 = new f("stiles0");
      this.c = var20.a;
      this.a(70);
      this.q = new f("mini_icons");
      this.a(72);
      this.j = 37;
      this.a = super.W;
      this.b = super.X;
      this.c = this.a >> 1;
      this.d = this.b >> 1;
      this.A = 0;

      for (int var5 = 0; var5 < 12; var5++) {
         a[var5] = a.a(101 + var5);
      }

      f();
      this.a(74);

      try {
         this.e = e.a("settings", 1)[0];
      } catch (Exception var14) {
      }

      this.a(76);
      this.i = new String[0];
      this.i = new int[0];

      try {
         byte[] var21 = e.a("settings", 2);
         var17 = new DataInputStream(new ByteArrayInputStream(var21));
         this.R = var17.readInt();
         this.i = new int[this.R];
         this.i = new String[this.R];

         for (int var6 = 0; var6 < this.R; var6++) {
            this.i[var6] = var17.readInt();
            this.i[var6] = var17.readUTF();
         }

         var17.close();
      } catch (Exception var16) {
      }

      this.a(80);
      this.T = e.a("download");
      this.a(84);
      this.h = new String[3];
      this.m = new byte[3];
      this.h = new int[3];

      for (int var22 = 0; var22 < 3; var22++) {
         this.m[var22] = -1;
         this.h[var22] = -1;
         byte[] var24 = null;

         try {
            var24 = e.a("save", var22);
         } catch (Exception var13) {
         }

         if (var24 != null && var24.length != 0) {
            byte var7 = (var17 = new DataInputStream(new ByteArrayInputStream(var24))).readByte();
            byte var8 = var17.readByte();
            var17.readByte();
            var17.readByte();
            byte var11 = var17.readByte();
            short var12 = var17.readShort();
            var17.close();
            this.m[var22] = var11;
            this.h[var22] = this.a(var7, var8, var12);
            this.h[var22] = var8;
         } else {
            this.h[var22] = "\n" + a.a(79) + "\n ";
         }
      }

      this.a(90);
      int var23 = 0;
      String var25;
      if ((var25 = b.a.getAppProperty("ProvisionX-Highscore-gameCode")) != null) {
         this.e = var25.trim();
      }

      if ((var25 = b.a.getAppProperty("ProvisionX-Highscore-portalCode")) != null) {
         this.d = var25.trim();
      }

      if ((var25 = b.a.getAppProperty("ProvisionX-Highscore-Url")) != null) {
         this.f = var25.trim();
      }

      if ((var25 = b.a.getAppProperty("ms-highscoreUpload")) != null) {
         this.s = Integer.parseInt(var25.trim()) == 1;
      }

      if ((var25 = b.a.getAppProperty("ms-skPos")) != null) {
         var23 = Integer.parseInt(var25.trim());
      }

      if ((var25 = b.a.getAppProperty("MIDlet-Version")) != null) {
         this.a = var25.trim();
      }

      this.a(96);
      if (var23 == 1) {
         h = 2048;
         i = 1024;
      }

      this.a(100);
      e.b(0, 0);
      this.h = 0;
   }

   public final void a(int var1) {
      this.U = var1;
      a.a.a();
   }

   public final String a(int var1, int var2, int var3) {
      String var4;
      if (var1 == 0) {
         var4 = a.a(121 + var2);
      } else {
         var4 = this.b(var2);
      }

      return a.a(32 + var1) + "\n" + var4 + "\n" + "Current turn: " + (var3 + 1);
   }

   public final boolean a() {
      return this.l && a.a.a == this;
   }

   public final void e() throws Exception {
      this.a = null;
      this.b = null;
      this.c = null;
      this.d = null;
      System.gc();
      this.b = super.X - a;
      this.d = this.b >> 1;
      e.f();
      if (this.h != 1) {
         this.h = 1;
         c.a(this);
         e.b("/1.pak");
         this.a = new f[5][12];

         for (byte var1 = 0; var1 < 5; var1++) {
            f var3;
            int var4 = (var3 = new f("unit_icons", var1)).e() / 12;

            for (byte var2 = 0; var2 < 12; var2++) {
               if (var1 == 0) {
                  h[] var12 = new h[]{var3.a[var2]};
                  this.a[var1][var2] = new f(var12);
               } else {
                  h[] var5 = new h[var4];

                  for (int var6 = 0; var6 < var4; var6++) {
                     var5[var6] = var3.a[var6 * 12 + var2];
                  }

                  this.a[var1][var2] = new f(var5);
               }
            }
         }

         h[] var11 = (new f("tiles0")).a;
         this.j = var11.length;
         h[] var13 = new h[10];

         for (byte var7 = 0; var7 <= 4; var7++) {
            f var14 = new f("buildings", var7);

            for (byte var9 = 0; var9 < 2; var9++) {
               var13[var7 * 2 + var9] = var14.a[var9];
            }
         }

         this.d = new h[var11.length + var13.length];
         System.arraycopy(var11, 0, this.d, 0, var11.length);
         System.arraycopy(var13, 0, this.d, this.j, var13.length);
         this.a = new Image[2][this.d.length];

         for (byte var8 = 0; var8 < 2; var8++) {
            for (byte var10 = 0; var10 < this.d.length; var10++) {
               this.a[var8][var10] = Image.createImage(24, 24);
               Graphics var15 = this.a[var8][var10].getGraphics();
               this.d[var10].a(var15, 0, 0);
               this.s.a(var15, var8, 0, 0, 0);
            }
         }

         this.l = new f("portraits");
         this.a = new f("cursor");
         this.i = new f("redspark");
         this.g = new f("smoke");
         this.h = new f("spark");
         this.j = new f("status");
         this.u = new f("arrow_icons");
         this.g = new h("tombstone");
         this.t = new f("levelup");
         this.b = new f[2];
         this.b[0] = new f("king_head_icons");
         this.b[1] = new f("king_head_icons", (byte)0);
         this.a.a(a[0]);
         this.b = new f(this.a);
         this.b.a(a[3]);
         this.e = new h[2];
         this.G = e[0];
         this.e[0] = this.d[e[0]];
         this.e[1] = this.d[e[1]];
         this.r = new f("b_smoke");
      }
   }

   public final void a(int var1, int var2) {
      if (this.b == 0 && this.h == 1 && this.c == 0) {
         boolean var3 = false;
         this.a.append(var2);
         String var4 = this.a.toString();

         for (int var5 = 0; var5 < l.length; var5++) {
            if (var4.equals(l[var5])) {
               if (var5 == 0) {
                  if (this.s == 7) {
                     this.r = true;
                  } else {
                     this.u();
                  }
               } else if (var5 == 1) {
                  this.f[this.f] = this.f[this.f] + 1000;
               }

               this.t = true;
            } else if (l[var5].startsWith(var4)) {
               var3 = true;
            }
         }

         if (!var3) {
            this.a = new StringBuffer();
         }
      }
   }

   public final void a() {
      this.t = true;
      this.u = true;
      this.F = true;
      this.E = true;
   }

   public final byte[] a() throws Exception {
      this.d[this.f][0] = (byte)this.q;
      this.d[this.f][1] = (byte)this.r;
      ByteArrayOutputStream var1 = new ByteArrayOutputStream();
      DataOutputStream var2;
      (var2 = new DataOutputStream(var1)).writeByte(this.b);
      var2.writeByte(this.s);
      var2.writeByte(this.e);
      var2.writeByte(this.f);
      var2.writeByte(this.j[this.f]);
      var2.writeShort(this.a);
      var2.writeByte(this.I);
      var2.writeByte(this.e);

      for (int var3 = 0; var3 < this.e; var3++) {
         var2.writeByte(this.k[var3]);
         var2.writeByte(this.l[var3]);
         var2.writeShort(this.f[var3]);
         var2.writeByte(this.d[var3][0]);
         var2.writeByte(this.d[var3][1]);
      }

      var2.writeByte(this.g);

      for (int var6 = 0; var6 < this.e.length; var6++) {
         var2.writeByte(this.b[this.e[var6][0]][this.e[var6][1]]);
      }

      var2.writeByte(this.a.size());
      int var7 = 0;

      for (int var4 = this.a.size(); var7 < var4; var7++) {
         c var5 = (c)this.a.elementAt(var7);
         var2.writeByte(var5.d);
         var2.writeByte(var5.e);
         var2.writeByte(var5.f);
         var2.writeByte(var5.g);
         var2.writeByte(var5.g);
         var2.writeByte(var5.a);
         var2.writeShort(var5.a);
         var2.writeShort(var5.c);
         var2.writeShort(var5.d);
         var2.writeByte(var5.h);
         var2.writeByte(var5.i);
         if (var5.d == 9) {
            var2.writeByte(var5.j);
            var2.writeShort(var5.k);
            var2.writeByte(this.b[var5.e] == var5 ? 1 : 0);
         }
      }

      var2.writeShort((short)this.aC);
      var2.writeInt((short)this.k);
      var2.writeInt(this.aD);
      var2.writeByte(this.y ? 0 : 1);
      byte[] var8 = var1.toByteArray();
      var2.close();
      return var8;
   }

   public final void a(byte[] var1) throws Exception {
      DataInputStream var2 = new DataInputStream(new ByteArrayInputStream(var1));
      this.b = var2.readByte();
      this.s = var2.readByte();
      this.e = var2.readByte();
      this.b(this.s);
      this.f = var2.readByte();
      var2.readByte();
      this.a = var2.readShort();
      this.I = var2.readByte();
      this.e = var2.readByte();

      for (int var3 = 0; var3 < this.e; var3++) {
         this.k[var3] = var2.readByte();
         this.l[var3] = var2.readByte();
         this.f[var3] = var2.readShort();
         this.d[var3][0] = var2.readByte();
         this.d[var3][1] = var2.readByte();
      }

      this.g = var2.readByte();

      for (int var21 = 0; var21 < this.e.length; var21++) {
         this.b[this.e[var21][0]][this.e[var21][1]] = var2.readByte();
      }

      this.a = new c[this.e][4];
      this.e = new int[this.e];
      this.i();
      byte var22 = var2.readByte();
      int var4 = 0;

      for (byte var5 = var22; var4 < var5; var4++) {
         byte var6 = var2.readByte();
         byte var7 = var2.readByte();
         byte var8 = var2.readByte();
         byte var9 = var2.readByte();
         byte var10 = var2.readByte();
         byte var11 = var2.readByte();
         short var12 = var2.readShort();
         short var13 = var2.readShort();
         short var14 = var2.readShort();
         byte var15 = var2.readByte();
         byte var16 = var2.readByte();
         c var17;
         (var17 = c.a(var6, var7, var13, var14)).f = var8;
         var17.a = var12;
         var17.a(var11);
         var17.g = var9;
         var17.b();
         var17.g = var10;
         var17.h = var15;
         var17.i = var16;
         if (var6 == 9) {
            byte var18 = var2.readByte();
            short var19 = var2.readShort();
            var17.b((int)var18);
            var17.k = var19;
            if (var2.readByte() == 1) {
               this.b[var17.e] = var17;
            }
         }
      }

      this.aC = var2.readShort();
      this.k = var2.readInt();
      this.aD = var2.readInt();
      this.y = var2.readByte() != 0;
      var2.close();
      if (this.s == 6 && this.aC > 32) {
         this.e = this.a(a.a(121 + this.s), a.a(138), this.b, -1);
         this.e.a((byte)0, true);
         this.e.a((a)null);
      }

      this.e(this.d[this.f][0], this.d[this.f][1]);
      this.c(this.d[this.f][0], this.d[this.f][1]);
      e.a(c[this.j[this.f]], 0);
   }

   public final void a(int var1, a var2) {
      try {
         e.a("save", var1, this.a());
         this.h[var1] = this.a(this.b, this.s, this.a);
         this.m[var1] = this.j[this.f];
         this.h[var1] = this.s;
         this.u.a(null, this.h[var1], this.a, -1);
         this.u.G = b[this.m[var1]];
         this.u.a();
         d var3;
         (var3 = this.a(null, a.a(77), this.b, 1000)).a = var2;
         a.a.a(var3);
      } catch (Exception var4) {
      }
   }

   public static final void f() {
      try {
         byte[] var0 = e.a("settings", 0);

         for (int var1 = 0; var1 < 4; var1++) {
            e.a[var1] = (var0[0] & 1 << var1) != 0;
         }
      } catch (Exception var2) {
      }
   }

   public final void g() {
      try {
         byte[] var1 = new byte[1];

         for (int var2 = 0; var2 < 4; var2++) {
            if (e.a[var2]) {
               var1[0] = (byte)(var1[0] | 1 << var2);
            }
         }

         e.a("settings", 0, var1);
      } catch (Exception var3) {
      }
   }

   public final void a(c var1) {
      this.Q = 0;
      this.e(var1.c, var1.d);
      this.h = var1;
   }

   public final void a(c var1, c var2) {
      if (var2.f == 4) {
         this.c = var2;
         this.a(this.i, this.c.n, this.c.o, 0, 0, 1, 50);
         this.z = 6;
         this.a.d();
         this.c = 0;
         this.j();
         this.a.a(a[0]);
         if (this.l[this.f] == 0) {
            this.j = this.c;
            this.k = 6;
            return;
         }
      } else {
         if (e.a[3] && var2.a.length > 0) {
            this.f = true;
            this.B = 0;
            e.f();
         } else {
            this.c = 13;
            this.E = 0;
            this.a.a(a[0]);
         }

         this.e = var1;
         this.f = var2;
      }
   }

   public final void h() {
      this.j();
      if (this.e.g <= 0) {
         this.b = this.e;
      } else if (this.e.a()) {
         this.e.addElement(this.e);
      }

      if (this.f.g <= 0) {
         this.b = this.f;
      } else {
         if (this.e.a((short)128)) {
            this.a(this.h, this.f.n, this.f.o, 0, 0, 1, 50);
            f var1;
            (var1 = f.a(this.j, 0, 0, -4, -1, 800, (byte)5)).b(this.f.n + (this.f.p - var1.p) / 2, this.f.o - var1.q);
            var1.a(d);
            this.c.addElement(var1);
            this.f.b((byte)1);
         }

         if (this.f.a()) {
            this.e.addElement(this.f);
         }
      }

      if (this.b != null) {
         this.e(this.b.c, this.b.d);
         this.a(this.h, this.b.n, this.b.o, 0, 0, 1, 50);
         e.b(12, 1);
      }

      this.e = this.c;
      if (this.l[this.f] == 0) {
         this.j = this.c;
         this.k = 6;
      }

      this.a.a(a[0]);
      this.c = 0;
      this.e.d();
      this.f = null;
      this.e = null;
   }

   public final f a(f var1, int var2, int var3, int var4, int var5, int var6, int var7) {
      f var8;
      (var8 = f.a(var1, var4, var5, 0, var6, var7, (byte)0)).b(var2, var3);
      this.d.addElement(var8);
      return var8;
   }

   public final void b(c var1) {
      this.e = true;
      this.d = !this.k;
      this.ae = 12;
      this.c = 1;
      this.h = true;
      this.a(this.c, 0);
      var1.b(this.c);
      this.a = true;
      this.b = false;
      this.a.a(a[2]);
   }

   public final void a(byte[] var1, int var2, int var3, a var4) {
      d var5 = new d((byte)0, 0);
      this.K = var2;
      this.L = var3;
      int var6 = var1.length;
      Vector var7 = new Vector(var6);
      Vector var8 = new Vector(var6);

      for (int var9 = 0; var9 < var6; var9++) {
         byte var10 = var1[var9];
         if (this.s || var10 != 6) {
            var7.addElement(this.e[var10]);
            var8.addElement(this.b[var10]);
         }
      }

      String[] var11 = new String[var7.size()];
      h[] var12 = new h[var8.size()];
      var7.copyInto(var11);
      var8.copyInto(var12);
      var5.a(var11, var12, super.Y, this.K, this.L, 3, (byte)1);
      var5.a(var4);
      a.a.a(var5);
   }

   public final void a(byte[] var1, c var2) {
      this.a = new d((byte)0, 0);
      int var3;
      String[] var4 = new String[var3 = var1.length];
      h[] var5 = new h[var3];

      for (int var6 = 0; var6 < var1.length; var6++) {
         var4[var6] = this.d[var1[var6]];
         var5[var6] = this.a[var1[var6]];
      }

      if (this.r * 24 <= this.b / 2 - 24) {
         this.a.a(var4, var5, 0, this.b - this.e.q, 36);
      } else {
         this.a.a(var4, var5, this.a, 0, 8);
      }

      this.a.a(this);
      a.a.a(this.a);
   }

   public final d a(String var1, h var2) {
      String[] var3 = new String[3];

      for (int var4 = 0; var4 < 3; var4++) {
         var3[var4] = "SLOT " + (var4 + 1) + "/" + 3;
      }

      this.t = new d((byte)14, 0);
      this.t.a(var3, this.a, -1);
      this.u = new d((byte)10, 0);
      this.u.a(null, this.h[0], this.a, -1);
      if (this.m[0] != -1) {
         this.u.G = b[this.m[0]];
      }

      d var7 = new d((byte)15, 15);
      int var5 = (this.b - this.t.g - this.u.g) / 2;
      d var6;
      (var6 = new d((byte)10, 0)).a(null, var1, this.a, -1);
      var6.a = var2;
      var7.a(var6, 0, 0, 0);
      var5 += var6.g / 2;
      var7.a(this.t, 0, var5, 0);
      var5 += this.t.g;
      var7.a(this.u, 0, var5, 20);
      var7.g = true;
      var7.a((byte)0, true);
      return var7;
   }

   public final void a(a var1) {
      int var2;
      String[] var3 = new String[var2 = this.q.length];
      int[] var4 = new int[var2];
      int var5 = 0;

      for (int var6 = 0; var6 < var2; var6++) {
         boolean var7 = false;

         for (int var8 = 0; var8 < this.R; var8++) {
            if (this.q[var6].equals(this.i[var8])) {
               var7 = true;
               break;
            }
         }

         if (!var7) {
            var3[var5] = this.q[var6];
            var4[var5] = var6;
            var5++;
         }
      }

      this.D = new d((byte)15, 15);
      d var11;
      (var11 = new d((byte)10, 0)).a(null, a.a(48), this.a, -1);
      if (var5 == 0) {
         d var12;
         (var12 = new d((byte)10, 0)).a(null, a.a(52), this.a, this.d);
         this.D.a(var12, 0, (this.b + var11.g) / 2, 6);
      } else {
         String[] var13 = new String[var5];
         int[] var14 = new int[var5];
         System.arraycopy(var3, 0, var13, 0, var5);
         System.arraycopy(var4, 0, var14, 0, var5);
         this.F = new d((byte)10, 0);
         String var9 = this.c(this.T);
         this.F.a(null, a.a(54, this.c(this.k[var14[0]])) + "\n" + a.a(53, var9), this.a, -1);
         this.E = new d((byte)11, 0);
         this.E.a(var13, this.c, this.d, this.a, this.b - var11.g - this.F.g, 3, 4);
         this.E.a = var14;
         int var10 = (this.b - this.F.g - this.E.g + var11.g) / 2;
         this.D.a(this.E, 0, var10, 20);
         var10 += this.E.g;
         this.D.a(this.F, 0, var10, 20);
         this.D.g = true;
         this.D.a((byte)0, true);
      }

      this.D.a(var11, 0, 0, 20);
      this.D.a(var1);
   }

   public final d a(a var1) {
      if (this.i.length == 0) {
         d var3;
         d var4;
         (var3 = (var4 = new d((byte)10, 0)).a(a.a(49))).a = this.b[6];
         var4.a(null, a.a(52), super.W, -1);
         var4.a(0, (this.b + var3.g) / 2, 6);
         var4.a(var1);
         this.B = null;
         return var4;
      } else {
         this.B = new d((byte)11, 0);
         d var2;
         (var2 = this.B.a(a.a(49))).a = this.b[6];
         this.B.a(this.i, super.W / 2, (this.b + var2.g) / 2, this.a, this.b - var2.g, 3, 4);
         this.B.a(var1);
         return this.B;
      }
   }

   public final int a(int var1) {
      return var1 >= a.length ? this.i[var1 - a.length] + a.length : var1;
   }

   public final DataInputStream a(int var1) throws Exception {
      if (var1 >= a.length) {
         int var2 = var1 - a.length;
         return new DataInputStream(new ByteArrayInputStream(e.a("download", var2)));
      } else {
         return new DataInputStream(e.a("s" + var1));
      }
   }

   public final String b(int var1) {
      if (var1 >= a.length) {
         int var2 = var1 - a.length;

         for (int var3 = 0; var3 < this.i.length; var3++) {
            if (this.i[var3] == var2) {
               return this.i[var3];
            }
         }

         return null;
      } else {
         return a[var1];
      }
   }

   public final String c(int var1) {
      int var2;
      int var3 = (var2 = var1 * 100 / 1024) / 100;
      int var4 = var2 % 100;
      return var3 + "." + var4;
   }

   public final void a(d var1, int var2, String var3, byte var4) throws Exception {
      this.G = true;
      if (var1 == this.a && var4 == 1) {
         if (this.c == 3) {
            this.a.a(this.v, this.w);
            this.a.b(this.c);
            this.b(this.a);
            this.h = true;
         }
      } else if (var1 == this.v) {
         if (var4 == 0) {
            a.a.c();
         } else {
            this.v = null;
         }
      } else if (var1 == this.w) {
         if (var4 == 0) {
            this.a(this.c, this.K, this.L, var1.a);
         }

         this.w = null;
      } else if (var1 == this.x) {
         if (var4 == 0) {
            int var37 = this.t.i;
            this.a(var37, this.s);
         }

         this.x = null;
      } else if (var1 == this.p) {
         if (var4 == 2 || var4 == 3) {
            this.q.a(null, a.a(184 + this.p.a[var2].d), this.a, this.b - this.o.g - this.p.g);
            this.o.a = this.p.a[var2];
            this.q.a();
            this.o.a();
         }
      } else if (var1 == this.n) {
         if (var4 == 0) {
            c var36 = this.p.a[this.p.i];
            if (!this.a(var36, this.q, this.r)) {
               return;
            }

            this.a = this.a(var36, this.q, this.r);
            this.k = true;
            this.b(this.a);
            a.a.a(this);
         }

         this.n = null;
         this.p = null;
         this.q = null;
         this.o = null;
      } else if (var1 == this.c) {
         if (var4 == 2 || var4 == 3) {
            String var35;
            if (var2 == 0) {
               var35 = a.a(15);
            } else {
               var35 = a.a(196 + var2 - 1, true);
            }

            this.d.a(null, var35, this.a, this.d.g);
            this.d.a();
         }
      } else if (var1 == this.b) {
         this.b = null;
         this.c = null;
         this.d = null;
      } else if (var1 == this.e) {
         if (var4 == 0) {
            a.a.a(this);
         }
      } else if (var1 == this.i) {
         if (var4 != 0) {
            this.i = null;
         } else {
            this.j = new d((byte)15, 15);
            d var34;
            (var34 = new d((byte)10, 0)).a = this.b[4];
            var34.a(null, a.a(34), this.a, -1);
            this.j.a(var34, 0, 0, 20);
            String[] var47 = new String[this.i];

            for (int var59 = 0; var59 < this.i; var59++) {
               var47[var59] = a.a(38, "" + (var59 + 1));
            }

            int var60 = var34.g;
            d[] var70 = new d[this.i];
            this.a = new d[this.i];
            this.b = new d[this.i];

            for (int var73 = 0; var73 < this.i; var73++) {
               this.a[var73] = new d((byte)14, 6);
               this.a[var73].a(this.f, super.Y, -1);
               this.b[var73] = new d((byte)14, 5);
               this.b[var73].a(var47, super.Y, -1);
               this.b[var73].i = var73;
               int var75 = Math.max(this.a[var73].f, this.b[var73].f);
               int var79 = super.W - var75;
               this.a[var73].f = var75;
               this.b[var73].f = var75;
               this.j.a(this.a[var73], var79, var60, 20);
               int var61 = var60 + this.a[var73].g;
               this.j.a(this.b[var73], var79, var61, 20);
               var60 = var61 + this.b[var73].g;
               var70[var73] = new d((byte)10, 8);
               var70[var73].a(null, a.a(this.n[var73] - 1 + 89), var79, this.a[var73].g + this.b[var73].g);
               var70[var73].G = b[this.n[var73]];
               this.j.a(var70[var73], 0, var60, 36);
            }

            this.j.z = 1;
            d var74;
            (var74 = new d((byte)10, 8)).a(null, a.a(40), this.c, -1);
            this.j.a(var74, 0, var60, 20);
            this.k = new d((byte)14, 4);
            String[] var76 = new String[a.length];

            for (int var80 = 0; var80 < var76.length; var80++) {
               var76[var80] = "" + a[var80];
            }

            this.k.a(var76, this.c, var74.g);
            this.j.a(this.k, super.Y, var60, 20);
            var60 += var74.g;
            d var81;
            (var81 = new d((byte)10, 8)).a(null, a.a(41), this.c, -1);
            this.j.a(var81, 0, var60, 20);
            this.l = new d((byte)14, 4);
            String[] var83 = new String[c.length];

            for (int var84 = 0; var84 < var83.length; var84++) {
               var83[var84] = "" + c[var84];
            }

            this.l.a(var83, this.c, var81.g);
            this.j.a(this.l, super.Y, var60, 20);
            this.j.a(var1);
            this.j.a((byte)0, true);
            a.a.a(this.j);
         }
      } else if (var1 == this.j) {
         if (var4 == 0) {
            int var33 = 0;
            int var46 = 0;
            boolean[] var58 = new boolean[this.i];

            for (int var68 = 0; var68 < this.i; var68++) {
               if (this.a[var68].i == 2) {
                  this.l[var68] = 2;
               } else {
                  var33++;
                  if (this.a[var68].i == 0) {
                     this.l[var68] = 1;
                  } else if (this.a[var68].i == 1) {
                     this.l[var68] = 0;
                  }

                  this.k[var68] = (byte)this.b[var68].i;
                  if (!var58[this.k[var68]]) {
                     var46++;
                     var58[this.k[var68]] = true;
                  }
               }
            }

            if (var33 < 2 || var46 < 2) {
               d var69;
               (var69 = this.a(null, a.a(39), this.b, 2000)).a(this.j);
               a.a.a(var69);
               return;
            }

            this.j = null;
            this.i = null;
            a.a.a(this);
            this.f = a[this.k.i];
            this.g = c[this.l.i];
            this.a = null;
            this.k = null;
            this.l = null;
            this.b = 1;
            this.I = 8;
            this.i = true;
            a.a.a();
            this.e();
            this.b(this.t);
            this.s = this.t;
            this.i = false;
            this.c = 0;
         }
      } else {
         if (var1 == this.g) {
            int var5 = this.f.i;
            if (var4 == 0 && (var5 >= a.length || !this.a[var5])) {
               this.t = this.a(var5);
               DataInputStream var6;
               int var7 = (var6 = this.a(this.t)).readInt();
               int var8 = var6.readInt();
               byte[][] var9 = new byte[var7][var8];
               this.n = new byte[4];
               byte[] var10 = new byte[5];

               for (int var11 = 0; var11 < 5; var11++) {
                  var10[var11] = -1;
               }

               this.i = 0;

               for (int var77 = 0; var77 < var7; var77++) {
                  for (int var12 = 0; var12 < var8; var12++) {
                     var9[var77][var12] = var6.readByte();
                     int var13;
                     if (this.h[var9[var77][var12]] == 9 && (var13 = this.a(var77, var12, var9)) != 0 && var10[var13] == -1) {
                        this.n[this.i] = (byte)var13;
                        var10[var13] = this.i++;
                     }
                  }
               }

               var6.close();
               this.b = this.f.a[var5];
               this.i = new d((byte)15, 15);
               d var78;
               (var78 = new d((byte)10, 0)).a = this.b[4];
               var78.a(null, this.b, this.a, -1);
               d var82;
               (var82 = new d((byte)8, 0)).a(super.W, this.b - var78.g - this.e.q, var9, null);
               this.i.a(var82, this.c, this.d + (var78.g - this.e.q) / 2, 3);
               this.i.a(var78, 0, 0, 0);
               this.i.a(var1);
               this.i.a((byte)0, true);
               this.i.g = true;
               a.a.a(this.i);
            }
         } else if (var1 == this.m) {
            if (var4 == 1) {
               boolean var32 = e.a[0];
               boolean var45 = false;

               for (int var57 = 0; var57 < 4; var57++) {
                  boolean var67;
                  if ((var67 = this.c[var57].i == 0) != e.a[var57]) {
                     e.a[var57] = var67;
                     var45 = true;
                  }
               }

               if (var45) {
                  this.g();
                  if (var32 != e.a[0]) {
                     if (!e.a[0]) {
                        e.f();
                        return;
                     }

                     if (this.h == 1) {
                        if (this.c != 11 && this.c != 14) {
                           e.b(c[this.j[this.f]], 0);
                           return;
                        }
                     } else if (this.h == 0) {
                        e.b(0, 0);
                        return;
                     }
                  }
               } else {
                  this.m = null;
                  this.c = null;
               }
            }

            return;
         }

         if (var1 == this.s) {
            if (var4 == 0) {
               int var15 = this.t.i;
               if (this.m[var15] == -1) {
                  this.a(var15, var1);
               } else {
                  this.x = this.a(null, a.a(88), this.b, -1);
                  this.x.a((byte)0, true);
                  this.x.a(var1);
                  a.a.a(this.x);
               }
            } else {
               this.s = null;
               this.t = null;
               this.u = null;
            }
         } else if (var1 == this.r) {
            if (var4 == 0) {
               byte[] var16 = null;

               try {
                  var16 = e.a("save", this.t.i);
               } catch (Exception var14) {
               }

               if (var16 != null) {
                  this.r = null;
                  this.t = null;
                  this.u = null;
                  a.a.a(this);
                  this.i = true;
                  a.a.a();
                  this.e();
                  this.a(var16);
                  if (this.b == 0) {
                     this.l = true;
                  }

                  this.i = false;
                  this.c = 0;
               }
            } else {
               this.r = null;
               this.t = null;
               this.u = null;
            }
         } else if (var1 == this.t) {
            if (var4 == 2 || var4 == 3) {
               this.u.a(null, this.h[var2], this.a, -1);
               if (this.m[var2] == -1) {
                  this.u.G = 2370117;
               } else {
                  this.u.G = b[this.m[var2]];
               }

               this.u.a();
            }

            return;
         }

         if (var1 == this.y) {
            if (var4 == 0) {
               if (var3.equals(this.j[0])) {
                  if (this.n == null) {
                     this.a(0, "news", a.a(0), var1);
                     return;
                  }

                  this.A = this.a(this.n, var1);
                  return;
               }

               if (var3.equals(this.j[1])) {
                  this.z = new d((byte)11, 0);
                  d var17;
                  (var17 = this.z.a(var3)).a = this.b[6];
                  this.z.a(this.k, super.W / 2, (this.b + var17.g) / 2, this.a, this.b - var17.g, 3, 0);
                  this.z.a(var1);
                  a.a.a(this.z);
               }
            } else if (var4 == 1) {
               this.y = null;
            }
         } else if (var1 == this.z) {
            if (var4 == 0) {
               if (var3.equals(this.k[0])) {
                  if (this.q == null) {
                     this.a(2, "levels", a.a(0), var1);
                  } else {
                     this.a(var1);
                     a.a.a(this.D);
                  }
               } else if (var3.equals(this.k[1])) {
                  a.a.a(this.a(var1));
               }
            } else if (var4 == 1) {
               this.z = null;
            }
         } else if (var1 == this.A) {
            if (var4 == 0) {
               if (this.p[var2] == null) {
                  this.aI = var2;
                  this.a(1, this.o[var2], a.a(0), var1);
               } else {
                  d var18;
                  (var18 = this.a(this.n[var2], this.p[var2], this.b, this.b / 2, -1)).a(var1);
                  a.a.a(var18);
               }
            } else if (var4 == 1) {
               this.A = null;
            }
         } else if (var1 == this.D) {
            if (var4 == 0) {
               this.aJ = this.E.a[this.E.i];
               if (this.T >= this.k[this.aJ]) {
                  this.a(3, this.r[this.aJ], a.a(0), var1);
               } else {
                  d var19;
                  (var19 = this.a(null, a.a(55), this.b, -1)).a(var1);
                  a.a.a(var19);
               }
            } else if (var4 == 1) {
               this.F = null;
               this.E = null;
               this.D = null;
            }
         } else if (var1 == this.E) {
            if (var4 == 2 || var4 == 3) {
               String var20 = this.c(this.T);
               this.F.a(null, a.a(54, this.c(this.k[this.E.a[var2]])) + "\n" + a.a(53, var20), this.a, -1);
               this.F.a();
            }
         } else if (var1 == this.B) {
            if (var4 == 0) {
               if (this.i[var2] + a.length == this.s) {
                  d var21;
                  (var21 = this.a(null, a.a(56), this.b, -1)).a(var1);
                  a.a.a(var21);
               } else {
                  this.S = var2;
                  this.c = var3;
                  this.C = this.a(null, a.a(50, var3), this.b, this.d, -1);
                  this.C.a(var1);
                  this.C.a((byte)0, true);
                  a.a.a(this.C);
               }
            } else if (var4 == 1) {
               this.B = null;
            }
         } else if (var1 == this.C) {
            if (var4 == 0) {
               this.e(this.S);
               d var22 = this.a(this.B.a);
               d var38;
               (var38 = this.a(null, a.a(51, this.c), this.b, -1)).a(var22);
               a.a.a(var38);
            }

            this.C = null;
            this.c = null;
         }

         if (var1.b == 7) {
            a.a.a(this);
         } else if (var3 != null && var4 == 0) {
            if (var3.equals(this.e[0])) {
               if (this.h != 0 && this.c == 0) {
                  this.w = this.a(null, a.a(87), this.b, -1);
                  this.w.a((byte)0, true);
                  this.w.a(var1);
                  a.a.a(this.w);
               } else {
                  this.a(this.c, this.K, this.L, var1);
               }
            } else if (!var3.equals(this.e[1]) && var1 != this.h) {
               if (var3.equals(a.a(3))) {
                  this.h = new d((byte)11, 0);
                  int var30 = this.e;
                  if (this.e > 7) {
                     var30 = 7;
                  }

                  String[] var44 = new String[++var30];

                  for (int var55 = 0; var55 < var30; var55++) {
                     var44[var55] = var55 + 1 + ". " + a.a(121 + var55);
                  }

                  d var56;
                  (var56 = this.h.a(var3)).a = this.b[3];
                  this.h.a(var44, super.W / 2, (this.b + var56.g) / 2, this.a, this.b - var56.g, 3, 4);
                  this.h.a(var1);
                  a.a.a(this.h);
               } else if (var3.equals(a.a(4))) {
                  this.s = this.a(var3, this.b[10]);
                  this.s.a(var1);
                  a.a.a(this.s);
               } else if (var3.equals(a.a(5))) {
                  this.r = this.a(var3, this.b[2]);
                  this.r.a(var1);
                  a.a.a(this.r);
               } else if (!var3.equals(a.a(6))) {
                  if (var3.equals(a.a(7))) {
                     this.y = new d((byte)11, 0);
                     d var29;
                     (var29 = this.y.a(var3)).a = this.b[6];
                     this.y.a(this.j, super.W / 2, (this.b + var29.g) / 2, this.a, this.b - var29.g, 3, 0);
                     this.y.a(var1);
                     a.a.a(this.y);
                  } else if (var3.equals(a.a(8))) {
                     this.m = new d((byte)15, 15);
                     d var28;
                     (var28 = new d((byte)10, 0)).a = this.b[5];
                     var28.a(null, var3, this.a, -1);
                     this.m.a(var28, 0, 0, 20);
                     int var43 = var28.g;
                     d[] var54 = new d[4];
                     this.c = new d[4];

                     for (int var66 = 0; var66 < 4; var66++) {
                        byte var71 = 8;
                        if (var66 != 0) {
                           var71 = 9;
                        }

                        if (var66 != 3) {
                           var71 |= 2;
                        }

                        var54[var66] = new d((byte)10, var71);
                        var54[var66].a(null, e.a[var66], this.c, -1);
                        this.m.a(var54[var66], 0, var43, 20);
                        var71 = 4;
                        if (var66 != 0) {
                           var71 = 5;
                        }

                        if (var66 != 3) {
                           var71 |= 2;
                        }

                        this.c[var66] = new d((byte)14, var71);
                        this.c[var66].a(this.g, this.c, var54[var66].g);
                        this.c[var66].i = e.a[var66] ? 0 : 1;
                        this.m.a(this.c[var66], super.Y, var43, 20);
                        var43 += var54[var66].g;
                     }

                     this.m.z = 2;
                     this.m.a(var1);
                     a.a.a(this.m);
                  } else if (var3.equals(a.a(9))) {
                     this.b = new d((byte)15, 15);
                     d var27;
                     (var27 = new d((byte)10, 0)).a(null, var3, this.a, -1);
                     var27.a = this.b[7];
                     String[] var42 = new String[20];

                     for (int var51 = 0; var51 <= 19; var51++) {
                        if (var51 > 0) {
                           var42[var51] = a.a(g[var51 - 1]) + " " + var51 + "/" + 19;
                        } else {
                           var42[var51] = a.a(85) + " " + var51 + "/" + 19;
                        }
                     }

                     this.c = new d((byte)14, 2);
                     this.c.a(var42, this.a, -1);
                     this.d = new d((byte)10, 1);
                     this.d.a(null, a.a(15), this.a, this.b - var27.g - this.c.g - this.e.q * 2);
                     int var52 = var27.g + this.e.q;
                     this.b.a(this.c, this.c, var52, 17);
                     var52 += this.c.g;
                     this.b.a(this.d, this.c, var52, 17);
                     this.b.a(var27, 0, 0, 0);
                     this.b.a(var1);
                     this.b.g = true;
                     a.a.a(this.b);
                  } else if (var3.equals(a.a(10))) {
                     d var26 = new d((byte)15, 15);
                     d var41;
                     (var41 = new d((byte)10, 0)).a(null, var3, this.a, -1);
                     var41.a = this.b[8];
                     d var50 = new d((byte)10, 0);
                     String var65 = a.a(16, this.a);
                     var50.a(null, var65, this.a, this.b - var41.g - this.e.q * 2);
                     var26.a(var50, 0, (this.b + var41.g) / 2, 6);
                     var26.a(var41, 0, 0, 0);
                     var26.a(var1);
                     var26.g = true;
                     a.a.a(var26);
                  } else if (var3.equals(a.a(11))) {
                     this.v = this.a(null, a.a(86), this.b, -1);
                     this.v.a((byte)0, true);
                     this.v.a(var1);
                     a.a.a(this.v);
                  } else if (var3.equals(a.a(60))) {
                     this.a(this.b, this.d, this.b, var1);
                  } else if (var3.equals(a.a(61))) {
                     this.k = false;
                     this.b(this.a);
                     a.a.a(this);
                  } else if (var3.equals(a.a(62))) {
                     this.a(this.c, 0);
                     this.d = this.c;
                     this.c = 6;
                     this.h = true;
                     this.a = this.a.a(this.a.c, this.a.d, (byte)0);
                     this.u = 0;
                     this.a = true;
                     this.b = true;
                     this.a.a(this.c, this.a.c, this.a.d);
                     this.a.a(a[1]);
                     this.e(this.a[this.u].c, this.a[this.u].d);
                     this.d = true;
                     this.e = true;
                     a.a.a(this);
                  } else if (var3.equals(a.a(63))) {
                     this.n = new d((byte)15, 15);
                     this.n.K = this.b;
                     boolean var25 = false;
                     this.o = new d((byte)2, 2);
                     this.p = new d((byte)3, 1);
                     this.q = new d((byte)10, 3);
                     this.q.f = true;
                     this.o.a = this.p.a[0];
                     this.q.a(null, a.a(184 + this.p.a[0].d), this.a, this.b - this.o.g - this.p.g);
                     this.n.a(this.o, 0, 0, 0);
                     this.n.a(this.q, 0, this.o.g, 0);
                     this.n.a(this.p, 0, this.b, 32);
                     this.n.g = true;
                     this.n.a(this);
                     this.n.a((byte)0, true);
                     a.a.a(this.n);
                  } else if (var3.equals(a.a(64))) {
                     this.a.d();
                     this.j();
                     this.g = this.a((int)this.q, this.r, (byte)0);
                     this.c = 0;
                     a.a.a(this);
                  } else if (var3.equals(a.a(66))) {
                     this.n();
                     a.a.a(this);
                  } else if (var3.equals(a.a(68))) {
                     this.a((byte)this.j, this.a.c, this.a.d);
                     a.a.a(this.a(null, a.a(74), this.b, 1000));
                     e.b(9, 1);
                     this.a.d();
                     this.c = 0;
                  } else if (var3.equals(a.a(67))) {
                     if (this.b(this.a.c, this.a.d, this.a)) {
                        this.b(this.a.c, this.a.d, this.j[this.a.e]);
                        a.a.a(this.a(null, a.a(73), this.b, 1000));
                        this.c = 9;
                        e.b(9, 1);
                        this.d = this.c;
                     }

                     this.a.d();
                  } else if (var3.equals(a.a(69))) {
                     this.c = 7;
                     this.a = this.a.a(this.a.c, this.a.d, (byte)1);
                     this.a = true;
                     this.b = true;
                     this.a.a(this.c, this.a.c, this.a.d);
                     this.d = true;
                     a.a.a(this);
                  } else if (var3.equals(a.a(70))) {
                     d var24 = new d((byte)15, 15);
                     d var40;
                     (var40 = new d((byte)10, 0)).a(null, this.b, this.a, -1);
                     d var49;
                     (var49 = new d((byte)8, 0)).a(this.a, this.b - var40.g - this.e.q, this.b, this.a);
                     var24.a(var49, this.c, this.d + (var40.g - this.e.q) / 2, 3);
                     var24.a(var40, 0, 0, 0);
                     var24.a(var1);
                     var24.g = true;
                     a.a.a(var24);
                  } else {
                     if (var3.equals(a.a(71))) {
                        this.e.a((byte)0, false);
                        this.e.a(var1);
                        a.a.a(this.e);
                     }
                  }
               } else {
                  this.g = new d((byte)15, 15);
                  d var23;
                  (var23 = new d((byte)10, 0)).a(null, var3, this.a, -1);
                  var23.a = this.b[4];
                  this.a = new boolean[12];

                  for (int var39 = this.e; var39 <= 7; var39++) {
                     this.a[a[var39]] = true;
                  }

                  String[] var48 = new String[12];

                  for (int var63 = 0; var63 < 12; var63++) {
                     if (this.a[var63]) {
                        var48[var63] = a.a(42);
                     } else {
                        var48[var63] = a[var63];
                     }
                  }

                  String[] var64 = new String[12 + this.R];
                  System.arraycopy(var48, 0, var64, 0, 12);
                  System.arraycopy(this.i, 0, var64, 12, this.R);
                  this.f = new d((byte)0, 0);
                  this.f.a(var64, 0, 0, this.a, this.b - var23.g - this.e.q * 2, 3, 4);
                  this.g.a(this.f, this.c, (this.b + var23.g) / 2, 3);
                  this.g.a(var23, 0, 0, 0);
                  this.g.g = true;
                  this.g.a((byte)0, true);
                  this.g.a(var1);
                  a.a.a(this.g);
               }
            } else {
               a.a.a(this);
               if (var1 == this.h) {
                  this.s = var2;
                  this.h = null;
               } else {
                  this.s = 0;
               }

               this.b = 0;
               this.l[1] = 0;
               this.i = true;
               a.a.a();
               System.gc();
               this.e();
               this.b(this.s);
               this.i = false;
               this.r();
               this.c = 0;
            }
         }
      }
   }

   public final c a(c var1, int var2, int var3) {
      this.f[this.f] = this.f[this.f] - var1.k;
      var1.g = 100;
      var1.a(var2, var3);
      if (!this.a.contains(var1)) {
         this.a.addElement(var1);
      }

      this.t = true;
      return var1;
   }

   public final c a(byte var1, int var2, int var3) {
      this.f[this.f] = this.f[this.f] - c.a[var1];
      this.t = true;
      return c.a(var1, this.f, var2, var3);
   }

   public final f a(byte var1, byte var2) {
      return this.a[var1][var2];
   }

   public final void i() {
      this.a = new Vector();
      this.a = null;
      this.a = null;
      this.i = null;
   }

   public final void b(int var1) throws Exception {
      e.f();
      this.c = new Vector();
      this.n = false;
      this.c = true;
      this.f = false;
      this.r = false;
      this.b = null;
      this.b = null;
      this.h = null;
      this.c = null;
      this.d = null;
      this.e.removeAllElements();
      this.a = 0;
      this.f = 0;
      this.f = 0;
      this.aC = 0;
      this.i();
      this.b = null;
      this.b = (byte[][])null;
      this.c = (byte[][])null;
      this.e = 0;

      for (int var2 = 0; var2 < 5; var2++) {
         this.i[var2] = -1;
      }

      this.h = true;
      e.b("/1.pak");
      DataInputStream var4;
      if (this.b == 0) {
         this.b = a.a(113 + var1);
         var4 = new DataInputStream(e.a("m" + var1));
      } else {
         this.b = this.b(var1);
         var4 = this.a(var1);
      }

      this.o = var4.readInt();
      this.p = var4.readInt();
      this.b = new byte[this.o][this.p];
      this.c = new byte[this.o][this.p];
      this.g = new byte[this.o][this.p];
      this.aw = 0;
      int var5 = 0;
      byte[][] var6 = new byte[30][3];
      byte[][] var7 = new byte[30][2];

      for (short var16 = 0; var16 < this.o; var16++) {
         for (short var3 = 0; var3 < this.p; var3++) {
            this.b[var16][var3] = var4.readByte();
            this.c[var16][var3] = 0;
            if (this.b[var16][var3] >= this.j || this.b[var16][var3] == 27) {
               int var8 = this.a(var16, var3);
               var6[var5][0] = (byte)var16;
               var6[var5][1] = (byte)var3;
               var6[var5][2] = (byte)var8;
               var5++;
               if (this.a(var16, var3) == 9) {
                  if (this.b == 1 && var8 != 0 && this.i[var8] == -1) {
                     this.j[this.e] = (byte)var8;
                     this.i[var8] = this.e++;
                  }

                  var7[this.aw][0] = (byte)var16;
                  var7[this.aw][1] = (byte)var3;
                  this.aw++;
               }
            }
         }
      }

      this.j = new int[var5];
      this.e = new byte[var5][];

      for (short var17 = 0; var17 < var5; var17++) {
         this.e[var17] = var6[var17];
      }

      this.f = new byte[this.aw][2];
      System.arraycopy(var7, 0, this.f, 0, this.aw);
      this.k = this.o * 24;
      this.l = this.p * 24;
      if (this.b == 1) {
         for (short var18 = 0; var18 < this.e; var18++) {
            this.f[var18] = this.f;
         }
      } else {
         this.e = 2;
         this.f[0] = 0;
         this.f[1] = 0;
         this.i[1] = 0;
         this.i[2] = 1;
         this.j[0] = 1;
         this.j[1] = 2;
         this.k[0] = 0;
         this.k[1] = 1;
         this.l[0] = 1;
         this.l[1] = 0;
         this.g = 100;
      }

      for (short var19 = 0; var19 < this.e.length; var19++) {
         byte var24;
         if ((var24 = this.e[var19][2]) > 0 && this.l[this.d(var24)] == 2) {
            this.b(this.e[var19][0], this.e[var19][1], 0);
         }
      }

      int var25 = var4.readInt();
      var4.skip(var25 * 4);
      int var9 = var4.readInt();
      this.b = new c[this.e];
      this.a = new c[this.e][4];
      this.e = new int[this.e];

      for (short var20 = 0; var20 < var9; var20++) {
         byte var10 = var4.readByte();
         int var11 = var4.readShort() / 24;
         int var12 = var4.readShort() / 24;
         byte var13 = (byte)(var10 % 12);
         byte var14 = (byte)this.d(1 + var10 / 12);
         if (this.l[var14] != 2) {
            c var15 = c.a(var13, var14, var11, var12);
            if (var13 == 9) {
               this.b[var14] = var15;
            }
         }
      }

      var4.close();
      if (this.b == 0) {
         this.e = this.a(a.a(121 + this.s), a.a(129 + this.s), this.b, -1);
      } else {
         this.e = this.e = this.a(a.a(71), a.a(137), this.b, -1);
      }

      this.z = false;
      this.q = null;
      this.m = null;
      this.n = null;
      this.o = null;
      this.p = null;
      this.r = null;

      for (short var21 = 0; var21 < this.b.length; var21++) {
         if (this.b[var21] == null) {
            this.d[var21][0] = 0;
            this.d[var21][1] = 0;
         } else {
            this.d[var21][0] = (byte)this.b[var21].c;
            this.d[var21][1] = (byte)this.b[var21].d;
         }
      }

      if (this.b == 1) {
         this.aC = 100;
         this.l = true;

         for (short var22 = 0; var22 < this.e; var22++) {
            if (this.l[var22] != 2) {
               this.f = (byte)var22;
               break;
            }

            this.a++;
         }
      }

      if (this.b[this.f] != null) {
         this.c(this.b[this.f].c, this.b[this.f].d);
         this.e(this.b[this.f].c, this.b[this.f].d);
      }

      this.d = new c[this.e.length];
      this.p = new byte[this.e.length];
      this.a = new f[this.e.length];

      for (short var23 = 0; var23 < this.e.length; var23++) {
         if (this.a((int)this.e[var23][0], (int)this.e[var23][1]) == 8) {
            this.a[var23] = f.a(this.r, 0, -1, 0, 1, 250, (byte)0);
            this.a[var23].d = false;
         }
      }

      if (this.l[this.f] == 0) {
         this.p();
      }
   }

   public final void j() {
      this.u = 0;
      this.a = null;
      this.a = new c[0];
      this.a(this.c, 0);
      this.a = false;
      this.b = false;
   }

   public final void a(byte[][] var1, int var2) {
      for (int var3 = 0; var3 < this.o; var3++) {
         for (int var4 = 0; var4 < this.p; var4++) {
            var1[var3][var4] = (byte)var2;
         }
      }
   }

   public final void c(c var1) {
      e.e(10);
      this.i = null;
      this.a(this.c, 0);
      this.a = false;
      if (this.l[this.f] == 1) {
         this.ad = 1;
         this.c = true;
         this.a.a(a[0]);
         this.c = 3;
         this.a(this.a(var1, (byte)0), var1);
         e.b(11, 1);
      } else {
         if (this.l[this.f] == 0) {
            this.k = 4;
            this.c = 0;
         }
      }
   }

   public final byte[] a(c var1, byte var2) {
      int var3 = 0;
      byte[] var4 = new byte[this.d.length];
      if (var2 == 1 && this.a(this.a.c, this.a.d) == 9 && this.b(this.a.c, this.a.d, var1.e)) {
         var3++;
         var4[0] = 0;
      }

      if (this.a(var1.c, var1.d, var1)) {
         var4[var3++] = 2;
      } else if (this.b(var1.c, var1.d, var1)) {
         var4[var3++] = 1;
      }

      if ((var2 == 1 || var1.d != 7) && var1.a.length > 0 && var1.a(var1.c, var1.d, (byte)0).length > 0) {
         var4[var3++] = 3;
      }

      if (var1.a((short)32) && var1.a(var1.c, var1.d, (byte)1).length > 0) {
         var4[var3++] = 4;
      }

      if (var2 == 1) {
         var4[var3++] = 5;
      } else {
         var4[var3++] = 6;
      }

      byte[] var5 = new byte[var3];
      System.arraycopy(var4, 0, var5, 0, var3);
      return var5;
   }

   public final void k() throws Exception {
      switch (this.A) {
         case 0:
            if (this.c >= 1200L) {
               this.A = 1;
            }

            this.B = 40;
            return;
         case 1:
            if (this.B <= 0) {
               this.a = null;
               this.B = 0;
               this.A++;
               this.a((int)0, 0, (int)3);
               return;
            }

            this.B--;
            return;
         case 2:
            this.a((int)1, 2, (int)3);
            this.c = new h("logo");
            this.A++;
            return;
         case 3:
            if (++this.B > 40) {
               try {
                  this.b = new h("splash");
                  this.d = new h("glow");
               } catch (Exception var2) {
               }

               this.B = 11;
               this.A++;
               a.a.b();
               return;
            }
            break;
         case 4:
            if (this.B < 16) {
               this.B++;
               this.D++;
               if (this.d != null) {
                  this.M = -this.d.a;
                  return;
               }
            } else {
               if (this.M >= super.W * 4) {
                  if (this.d != null) {
                     this.M = -this.d.a;
                  }
               } else {
                  this.M = this.M + this.c.a / 6;
               }

               if (this.c % 100L == 0L) {
                  this.j = !this.j;
               }

               if ((this.b == null || a.a.a()) && this.a()) {
                  if (this.d != null) {
                     this.M = -this.d.a;
                  }

                  this.j = false;
                  int var1 = this.c.b + 1;
                  this.a(this.a, (super.X + var1) / 2, super.X - var1, this.b == null ? null : this);
                  a.a.b();
               }
            }
      }
   }

   public final void c() throws Exception {
      this.c += 50L;
      if (this.h == 2) {
         this.w();
      } else if (this.h == 3) {
         this.m();
      } else if (this.h == 0) {
         this.k();
      } else {
         this.s();
         if (this.H != -1) {
            if (e.a[2]) {
               d var4;
               (var4 = this.a(a.a(196 + this.H, true), (byte)-1, (byte)2)).H = 7831691;
               var4.G = 7831691;
               var4.a = 16250855;
            }

            this.H = -1;
         }

         if (a.a.a == this) {
            if (this.c == 0) {
               for (int var1 = 0; var1 < this.a.length; var1++) {
                  int var22 = this.a((int)this.e[var1][0], (int)this.e[var1][1]);
                  if (this.a[var1] != null && var22 != -1 && var22 != 0 && !this.a[var1].d && e.a.nextInt() % 8 == 0) {
                     this.a[var1].d = true;
                     this.a[var1].c(0);
                     this.a[var1].s = 1;
                     this.a[var1].b((this.e[var1][0] + 1) * 24 - this.r.p, this.e[var1][1] * 24 - 2);
                     this.d.addElement(this.a[var1]);
                  }
               }
            }

            if (this.c - this.h >= 300L) {
               this.g = !this.g;
               this.h = this.c;
            }

            if (this.B && this.c - this.n >= this.m) {
               this.B = false;
            }

            if (this.f) {
               this.B++;
               if (this.B > 16) {
                  if (this.c == 10) {
                     this.aG = 1;
                  } else if (this.c == 11) {
                     if (this.b == 0) {
                        this.p = true;
                        this.o = true;
                        this.O = 0;
                     }

                     this.J = 0;
                     this.d = this.c;
                  } else {
                     this.b(this.e, this.f);
                     this.j = null;
                     this.j();
                  }

                  this.f = false;
               }
            } else {
               if (this.p) {
                  if (this.n) {
                     if (this.O < 16) {
                        this.O++;
                     }
                  } else if (this.o) {
                     this.O++;
                     if (this.O > 16) {
                        this.o = false;
                     }
                  }
               }

               if (this.b != null) {
                  this.x = (this.x + 1) % 12;
               }

               if (this.a) {
                  if (this.an == 0) {
                     this.am++;
                     if (this.am >= 15) {
                        this.an = 1;
                     }
                  } else {
                     this.am--;
                     if (this.am <= 0) {
                        this.an = 0;
                     }
                  }

                  if (this.ae > 0) {
                     this.ae -= 4;
                     if (this.ae < 0) {
                        this.ae = 0;
                     }
                  }
               }

               if (this.c && this.c - this.a >= 200L) {
                  this.a.e();
                  this.a = this.c;
               }

               int var23 = this.q * 24;
               int var5 = this.r * 24;
               int var6 = this.a.n;
               int var7 = this.a.o;
               if (var23 > var6) {
                  var6 += 8;
               } else if (var23 < var6) {
                  var6 -= 8;
               }

               if (var5 > var7) {
                  var7 += 8;
               } else if (var5 < var7) {
                  var7 -= 8;
               }

               this.a.b(var6, var7);
               if (!this.m && this.N > 0) {
                  if (this.N < 2) {
                     this.N = 0;
                  } else {
                     this.N /= 2;
                  }

                  this.t = true;
                  this.u = true;
               } else if (this.c == 8) {
                  if (this.y == 0) {
                     if (this.N >= a) {
                        this.y = 1;
                        this.o();
                        String var8;
                        if (this.l[this.f] == 1) {
                           var8 = "" + this.ar;
                        } else {
                           var8 = "?";
                        }

                        d var9 = this.a(a.a(75), a.a(76, var8), this.b, 1500);
                        a.a.a(var9);
                        var9.G = b[this.j[this.f]];
                        e.a(c[this.j[this.f]], 0);
                        return;
                     }

                     if (this.N == 0) {
                        this.m = true;
                        this.N = 1;
                     } else {
                        this.N *= 2;
                     }

                     this.t = true;
                     this.u = true;
                  } else {
                     for (int var16 = this.a.size() - 1; var16 >= 0; var16--) {
                        c var24;
                        if ((var24 = (c)this.a.elementAt(var16)).f != 3
                           && this.f == var24.e
                           && (this.a(var24.c, var24.d) == 7 || this.a(var24.c, var24.d, this.k[var24.e]))
                           && var24.g < 100) {
                           int var37;
                           if ((var37 = 100 - var24.g) > 20) {
                              var37 = 20;
                           }

                           var24.g += var37;
                           f var10;
                           (var10 = f.a("+" + var37, 0, -4, (byte)1)).b(var24.n + var24.p / 2, var24.o + var24.q);
                           this.c.addElement(var10);
                        }
                     }

                     this.y = 0;
                     this.m = false;
                     this.c = 0;
                  }
               } else if (this.c == 9) {
                  this.c = 0;
               } else if (this.c == 11) {
                  if (!this.f && this.J == 0 && (this.b == 1 || this.c - this.d >= 3000L || a.a.a())) {
                     this.b = super.X;
                     this.d = super.Z;
                     this.a(this.a, super.Z, super.X, null);
                     this.J = 1;
                     this.o = false;
                  }
               } else if (this.c != 10 && this.c != 14) {
                  if (this.c == 13) {
                     if (this.E == 0) {
                        e.c(200);
                        int var26 = this.e.c(this.f);
                        this.f.a(400);
                        e.b(14, 1);
                        this.a(this.i, this.f.n, this.f.o, 0, 0, 2, 50);
                        f var39 = f.a("-" + var26, 0, -4, (byte)1);
                        int var46;
                        if ((var46 = this.f.n + this.f.p / 2) + var39.p / 2 > this.k) {
                           var46 = this.k - var39.p / 2;
                        } else if (var46 - var39.p / 2 < 0) {
                           var46 = var39.p / 2;
                        }

                        var39.b(var46, this.f.o + this.f.q);
                        this.c.addElement(var39);
                        this.g = this.c;
                        this.E++;
                     } else if (this.E == 1) {
                        if (this.c - this.g >= 800L) {
                           this.e(this.e.c, this.e.d);
                           if (this.f.a(this.e, this.e.c, this.e.d)) {
                              e.c(200);
                              int var27 = this.f.c(this.e);
                              this.e.a(400);
                              e.b(14, 1);
                              this.a(this.i, this.e.n, this.e.o, 0, 0, 2, 50);
                              f var40 = f.a("-" + var27, 0, -4, (byte)1);
                              int var47;
                              if ((var47 = this.e.n + this.e.p / 2) + var40.p / 2 > this.k) {
                                 var47 = this.k - var40.p / 2;
                              } else if (var47 - var40.p / 2 < 0) {
                                 var47 = var40.p / 2;
                              }

                              var40.b(var47, this.e.o + this.e.q);
                              this.c.addElement(var40);
                              this.g = this.c;
                              this.E++;
                           } else {
                              this.h();
                           }
                        }
                     } else if (this.c - this.g >= 800L) {
                        this.h();
                     }
                  } else if (this.h != null) {
                     if (this.Q == 0) {
                        if (this.v) {
                           this.v = this.a(this.h, this.h.n, -this.n, 0, 12, -1, 0);
                           d var28;
                           (var28 = this.a(null, a.a(280), this.b, 2000)).a(this.c, 2, 17);
                           a.a.a(var28);
                           this.Q = 1;
                        }
                     } else if (this.Q == 1) {
                        for (int var17 = 0; var17 < 3; var17++) {
                           this.a(this.r, this.v.n + e.a(this.v.p - this.r.p), this.v.o, 0, e.a(-3, 0), 1, 50 * e.a(4));
                        }

                        if (this.v.o >= this.h.o) {
                           this.v.d = false;
                           e.c(200);
                           this.d(500);
                           if (this.q) {
                              int var29;
                              if ((var29 = 25 + e.a(25)) > this.h.g) {
                                 var29 = this.h.g;
                              }

                              this.h.g -= var29;
                              f var41;
                              (var41 = f.a("-" + var29, 0, -4, (byte)1)).b(this.h.n + this.h.p / 2, this.h.o + this.h.q);
                              this.c.addElement(var41);
                           }

                           this.d(this.h);
                           this.Q = 2;
                        }
                     } else if (++this.Q >= 20) {
                        if (this.h.g <= 0) {
                           this.b = this.h;
                           this.a(this.h, this.b.n, this.b.o, 0, 0, 1, 50);
                           e.b(12, 1);
                           this.e = this.c;
                        }

                        this.h = null;
                     }
                  } else if (this.c != null) {
                     if (--this.z <= 0) {
                        e.c(100);
                        this.d(this.c);
                        this.a((byte)27, this.c.c, this.c.d);
                        this.c = null;
                     }
                  } else if (this.b != null) {
                     if (this.c - this.e >= 300L && this.b(this.b.c, this.b.d)) {
                        if (this.b == 0 && this.s == 7 && this.b == this.b[1]) {
                           this.r = true;
                        } else {
                           this.a(this.g, this.b.n, this.b.o, 0, -3, 1, 100);
                           this.b.f = 3;
                           this.b.h = 3;
                           if (this.b.d == 10 || this.b.d == 11) {
                              this.b.a();
                           } else if (this.b.d == 9) {
                              this.b.a(-10, -10);
                              this.b.g = 0;
                              this.b.b();
                           }

                           if (this.b.d == 9 && this.b.k < 1000) {
                              this.b.k += 200;
                           }
                        }

                        this.b = null;
                     }
                  } else if (this.e.size() > 0) {
                     c var30 = (c)this.e.elementAt(0);
                     if (this.P == 0) {
                        this.e(var30.c, var30.d);
                        this.P = 1;
                     } else if (this.b(var30.c, var30.d)) {
                        this.a(this.k, var30.n + e.a(var30.p), var30.o + e.a(var30.q), 0, 0, 1, 50);
                        if (this.P == 1) {
                           e.b(13, 1);
                        }

                        if (this.P <= 5) {
                           short var42 = 200;
                           if (this.P == 5) {
                              var42 = 1000;
                           }

                           int var48 = var30.n + (var30.p - this.t.p) / 2;
                           int var11 = var30.o - this.P * 4;
                           if (var48 < 0) {
                              var48 = 0;
                           } else if (var48 + this.t.p > this.k) {
                              var48 = this.k - this.t.p;
                           }

                           if (var11 < 0) {
                              var11 = 0;
                           }

                           this.a(this.t, var48, var11, 0, 0, 1, var42);
                        }

                        this.P++;
                        if (this.P >= 20) {
                           this.e.removeElement(var30);
                           this.P = 0;
                           if (var30.d != 9 && var30.a <= 6 && var30.a % 2 == 0) {
                              a.a.a(this.a(null, a.a(80) + "\n" + var30.a, this.a, 2000));
                           }
                        }
                     }
                  } else if (this.d != null) {
                     if (this.c - this.f >= 400L) {
                        this.d.a();
                        c.a((byte)10, this.g, this.d.c, this.d.d).d();
                        this.d = null;
                     }
                  } else if (!this.z) {
                     if (this.c == 2) {
                        if (this.a.f != 1 && this.v) {
                           this.c(this.a);
                        }
                     } else if (this.l[this.f] == 0) {
                        this.q();
                     } else if (this.a()) {
                        if (this.e && a.a.b(h)) {
                           a.a.a(16);
                           a.a.b(h);
                        }

                        if (this.c != 6 && this.c != 7) {
                           if (this.c - this.b >= 150L && this.a.n % 24 == 0 && this.a.o % 24 == 0) {
                              if (!a.a.a(4) && !a.a.c(4)) {
                                 if (a.a.a(8) || a.a.c(8)) {
                                    if (this.q < this.o - 1) {
                                       this.q++;
                                    }

                                    this.h = true;
                                    this.b = this.c;
                                 }
                              } else {
                                 if (this.q > 0) {
                                    this.q--;
                                 }

                                 this.h = true;
                                 this.b = this.c;
                              }

                              if (!a.a.a(1) && !a.a.c(1)) {
                                 if (a.a.a(2) || a.a.c(2)) {
                                    if (this.r < this.p - 1) {
                                       this.r++;
                                    }

                                    this.h = true;
                                    this.b = this.c;
                                 }
                              } else {
                                 if (this.r > 0) {
                                    this.r--;
                                 }

                                 this.h = true;
                                 this.b = this.c;
                              }

                              if (this.h) {
                                 if (this.c == 1) {
                                    if (this.c[this.q][this.r] > 0) {
                                       this.b = this.a.a(this.a.c, this.a.d, this.q, this.r);
                                    }
                                 } else {
                                    this.g = this.a((int)this.q, this.r, (byte)0);
                                 }

                                 this.u = true;
                              }

                              this.h = false;
                           }

                           if ((this.c == 1 || this.c == 0) && a.a.a(256)) {
                              c var31;
                              if ((var31 = this.a((int)this.q, this.r, (byte)0)) != null) {
                                 d var43;
                                 (var43 = new d((byte)15, 15)).K = this.b;
                                 boolean var49 = false;
                                 d var50 = new d((byte)5, 2);
                                 d var12;
                                 (var12 = new d((byte)10, 1)).f = true;
                                 String var13 = a.a(184 + var31.d);
                                 if (var31.g != 0) {
                                    StringBuffer var14 = new StringBuffer(a.a(98));
                                    if ((var31.g & 2) != 0) {
                                       var14.append('\n');
                                       var14.append(a.a(100));
                                    }

                                    if ((var31.g & 1) != 0) {
                                       var14.append('\n');
                                       var14.append(a.a(99));
                                    }

                                    var14.append("\n-----------\n");
                                    var13 = var14.toString() + var13;
                                 }

                                 var12.a(null, var13, this.a, this.b - var50.g);
                                 var43.a(var50, 0, 0, 0);
                                 var43.a(var12, 0, var50.g, 0);
                                 var43.g = true;
                                 var43.a(this);
                                 a.a.a(var43);
                              }

                              a.a.b(256);
                           }

                           if (this.c == 1) {
                              if (a.a.a(16) && this.a != null) {
                                 c var32 = this.a((int)this.q, this.r, (byte)0);
                                 if (this.c[this.q][this.r] > 0 && (var32 == null || var32 == this.a)) {
                                    this.v = this.a.c;
                                    this.w = this.a.d;
                                    this.a.a(this.q, this.r, true);
                                    this.i = this.a;
                                    this.c = false;
                                    this.a = false;
                                    this.b = null;
                                    this.a = null;
                                    this.d = false;
                                    this.e = false;
                                    this.c = 2;
                                    e.b(10, 1);
                                 }

                                 a.a.b(16);
                              }
                           } else if (this.c == 0) {
                              if (a.a.a(512)) {
                                 int var33 = 0;
                                 c var44 = this.b[this.f];
                                 if (this.g != null && this.g.d == 9) {
                                    var44 = this.a[this.f][(this.g.j + 1) % this.e[this.f]];
                                 }

                                 while (++var33 < this.e[this.f] && var44.f == 3) {
                                    var44 = this.a[this.f][(var44.j + 1) % this.e[this.f]];
                                 }

                                 if (var44 != null && var44.f != 3) {
                                    this.e(var44.c, var44.d);
                                    this.b(var44.n + 12, var44.o + 12);
                                 }
                              } else if (a.a.a(32)) {
                                 if (this.b) {
                                    this.a(this.c, 0);
                                    this.a = false;
                                    this.b = false;
                                 } else {
                                    this.a = this.a((int)this.q, this.r, (byte)0);
                                    if (this.a != null) {
                                       this.a(this.c, 0);
                                       this.a.a(this.c);
                                       this.b = true;
                                       this.a = true;
                                       this.ae = 12;
                                    }
                                 }

                                 a.a.b(32);
                              } else if (a.a.a(16) || a.a.a(h)) {
                                 this.a = this.a((int)this.q, this.r, (byte)0);
                                 if (this.a != null && this.a.f == 0 && this.a.e == this.f) {
                                    byte[] var35;
                                    if ((var35 = this.a(this.a, (byte)1)).length > 1) {
                                       this.a(var35, this.a);
                                       e.b(11, 1);
                                    } else {
                                       this.k = false;
                                       this.b(this.a);
                                    }
                                 } else if (this.a(this.q, this.r) == 9 && this.b(this.q, this.r, this.f)) {
                                    byte[] var34 = new byte[]{0};
                                    this.a(var34, null);
                                    e.b(11, 1);
                                 } else {
                                    this.a = null;
                                    this.a = new d((byte)11, 0);
                                    this.a.a(this.b, 2, 2, -1, this.b, 20, 0);
                                    this.a.a(this);
                                    a.a.a(this.a);
                                    e.b(11, 1);
                                 }

                                 a.a.b();
                              }
                           }
                        } else {
                           if (!a.a.a(4) && !a.a.a(1)) {
                              if (a.a.a(8) || a.a.a(2)) {
                                 this.u++;
                                 if (this.u >= this.a.length) {
                                    this.u = 0;
                                 }

                                 a.a.b(8);
                                 a.a.b(2);
                                 this.h = true;
                              }
                           } else {
                              this.u--;
                              if (this.u < 0) {
                                 this.u = this.a.length - 1;
                              }

                              a.a.b(4);
                              a.a.b(1);
                              this.h = true;
                           }

                           this.e(this.a[this.u].c, this.a[this.u].d);
                           if (this.h) {
                              this.g = this.a((int)this.q, this.r, (byte)0);
                              this.u = true;
                           }

                           if (a.a.a(16)) {
                              if (this.c == 6) {
                                 this.a(this.a, this.a[this.u]);
                              } else if (this.c == 7) {
                                 this.a(this.a[this.u], this.f);
                                 this.a.d();
                                 this.c = 0;
                              }

                              this.a = null;
                              this.a = false;
                              this.b = false;
                              this.d = false;
                              this.e = false;
                           }

                           this.h = false;
                        }
                     }
                  }
               } else if (this.aG == 1 || this.c == 14 && this.aG != 2) {
                  this.s++;
                  if (this.s > this.e) {
                     String var25 = a[a[this.e]];
                     d var38 = this.a(null, a.a(82, var25), super.X, 3000);
                     a.a.a(var38);
                     this.e = this.s;

                     try {
                        byte[] var45 = new byte[]{(byte)this.e};
                        e.a("settings", 1, var45);
                     } catch (Exception var15) {
                     }
                  }

                  this.aG = 2;
               } else if (this.aG == 0) {
                  this.f = true;
                  this.B = 0;
               } else if (this.aG == 2) {
                  if (this.c == 14) {
                     this.b = super.X;
                     this.d = super.Z;
                     this.a(this.a, super.Z, super.X, null);
                     return;
                  }

                  if (this.s <= 7) {
                     this.b(this.s);
                     this.r();
                     this.c = 0;
                  }
               }

               int var18 = 0;

               for (int var3 = this.a.size(); var18 < var3; var18++) {
                  ((c)this.a.elementAt(var18)).c();
               }

               if (this.c - this.i >= 300L) {
                  this.F = (this.F + 1) % this.e.length;
                  this.d[this.G] = this.e[this.F];
                  this.i = this.c;
               }

               this.l();
               if (this.d && a.a.b(i)) {
                  if (this.c == 1) {
                     this.c = 0;
                     this.a(this.c, 0);
                     this.b = null;
                     this.a.a(a[0]);
                     this.e(this.a.c, this.a.d);
                     this.a = null;
                  } else if (this.c == 6 || this.c == 7) {
                     this.c = this.d;
                     this.a(this.c, 0);
                     this.a.a(a[0]);
                     this.e(this.a.c, this.a.d);
                     a.a.a(this.a);
                  }

                  this.a = false;
                  this.b = false;
                  a.a.b(i);
                  this.d = false;
                  this.e = false;
               }

               for (int var19 = this.c.size() - 1; var19 >= 0; var19--) {
                  f var36;
                  (var36 = (f)this.c.elementAt(var19)).c();
                  if (!var36.d) {
                     this.c.removeElement(var36);
                  }
               }

               var18 = 0;

               for (int var21 = this.d.size(); var18 < var21; var18++) {
                  this.c.addElement(this.d.elementAt(var18));
               }

               this.d.removeAllElements();
            }
         }
      }
   }

   public final void d(c var1) {
      int var2 = var1.o + 24;
      this.a(this.g, var1.n, var2 - this.g.q, 0, -2, 1, 100);

      for (int var3 = 0; var3 < 5; var3++) {
         this.a(this.r, var1.n, var2 - this.r.q, -2 + var3, e.a(-4, -1), 1, 50 + 50 * e.a(4));
      }

      this.a(this.h, var1.n, var1.o, 0, 0, 1, 100);
   }

   public final void a(c var1, byte var2) {
      this.d = var1;
      this.g = var2;
      this.a(this.h, var1.n - 8, var1.o - 8, 1, 1, 3, 50);
      this.a(this.h, var1.n + 8, var1.o - 8, -1, 1, 3, 50);
      this.a(this.h, var1.n - 8, var1.o + 8, 1, -1, 3, 50);
      this.a(this.h, var1.n + 8, var1.o + 8, -1, -1, 3, 50);
      this.f = this.c;
   }

   public final void l() {
      if (this.i == null) {
         this.d(this.a.n + 12, this.a.o + 12);
      } else {
         this.d(this.i.n + 12, this.i.o + 12);
      }
   }

   public final boolean a(int var1, int var2) {
      return this.m == this.b(var1) && this.n == this.c(var2);
   }

   public final boolean b(int var1, int var2) {
      return this.a(var1 * 24 + 12, var2 * 24 + 12);
   }

   public final int b(int var1) {
      int var2;
      if (this.k > this.a) {
         if ((var2 = this.c - var1) > 0) {
            var2 = 0;
         } else if (var2 < this.a - this.k) {
            var2 = this.a - this.k;
         }
      } else {
         var2 = (this.a - this.k) / 2;
      }

      return var2;
   }

   public final int c(int var1) {
      int var2;
      if (this.l > this.b) {
         if ((var2 = this.d - var1) > 0) {
            var2 = 0;
         } else if (var2 < this.b - this.l) {
            var2 = this.b - this.l;
         }
      } else {
         var2 = (this.b - this.l) / 2;
      }

      return var2;
   }

   public final void b(int var1, int var2) {
      this.m = this.b(var1);
      this.n = this.c(var2);
   }

   public final void c(int var1, int var2) {
      this.b(var1 * 24 + 12, var2 * 24 + 12);
   }

   public final void d(int var1, int var2) {
      this.v = true;
      int var3 = this.b(var1);
      int var4 = this.c(var2);
      int var5 = var3 - this.m;
      int var6 = var4 - this.n;
      if (var5 != 0) {
         int var7 = var5 / 2;
         if (var5 < 0) {
            if (var7 > -this.ad) {
               var7 = -this.ad;
            } else if (var7 < -this.V) {
               var7 = -this.V;
            }
         } else if (var7 < this.ad) {
            var7 = this.ad;
         } else if (var7 > this.V) {
            var7 = this.V;
         }

         this.m += var7;
         this.v = false;
      }

      if (var6 != 0) {
         int var8 = var6 / 2;
         if (var6 < 0) {
            if (var8 > -this.ad) {
               var8 = -this.ad;
            } else if (var8 < -this.V) {
               var8 = -this.V;
            }
         } else if (var8 < this.ad) {
            var8 = this.ad;
         } else if (var8 > this.V) {
            var8 = this.V;
         }

         this.n += var8;
         this.v = false;
      }
   }

   public final void e(int var1, int var2) {
      this.q = var1;
      this.r = var2;
      this.a.b(var1 * 24, var2 * 24);
      this.g = this.a((int)this.q, this.r, (byte)0);
      this.u = true;
   }

   public final void b(Graphics var1) {
      int var2 = -this.m / 24;
      int var3;
      if ((var3 = -this.n / 24) < 0) {
         var3 = 0;
      }

      int var4 = (this.a - this.m - 1) / 24;
      int var5;
      if ((var5 = (this.b - this.n - 1) / 24) >= this.p) {
         var5 = this.p - 1;
      }

      int var6;
      if (this.m < 0) {
         var6 = this.m % 24;
      } else {
         var6 = this.m;
      }

      int var8;
      if (this.n < 0) {
         var8 = this.n % 24;
      } else {
         var8 = this.n;
      }

      byte var9 = 0;
      if (this.b) {
         var9 = 1;
      }

      for (int var10 = var3; var10 <= var5; var10++) {
         int var7 = var6;

         for (int var11 = var2; var11 <= var4; var11++) {
            byte var13 = this.b[var11][var10];
            if (!this.a || this.c[var11][var10] == 0 || this.ae > 0) {
               this.d[var13].a(var1, var7, var8);
            }

            if (this.a && this.c[var11][var10] > 0) {
               if (this.ae != 0) {
                  var1.clipRect(var7 + this.ae, var8 + this.ae, 24 - this.ae * 2, 24 - this.ae * 2);
               }

               var1.drawImage(this.a[var9][var13], var7, var8, 0);
               if (this.ae != 0) {
                  var1.setClip(0, 0, this.a, this.b);
               }
            }

            int var12;
            if ((var12 = var10 + 1) < this.p && this.h[this.b[var11][var12]] == 9) {
               this.d[28].a(var1, var7, var8);
            }

            var7 += 24;
         }

         var8 += 24;
      }
   }

   public final void c(Graphics var1) {
      var1.setFont(e.b);
      var1.setColor(0);
      var1.fillRect(0, 0, super.W, super.X);
      var1.setColor(16777215);
      e.b(var1, a.a(58), super.W / 2, (super.X - e.b.getHeight()) / 2, 17);
   }

   public static final int a(int var0, int var1, int var2, int var3) {
      if (var2 == 0) {
         return var0;
      }

      if (var2 == var3) {
         return var1;
      }

      int var4 = var0 & 0xFF0000;
      int var5 = var0 & 0xFF00;
      int var6 = var0 & 0xFF;
      int var7 = (((var1 & 0xFF0000) - var4) * var2 / var3 & 0xFF0000) + var4;
      int var8 = (((var1 & 0xFF00) - var5) * var2 / var3 & 0xFF00) + var5;
      int var9 = ((var1 & 0xFF) - var6) * var2 / var3 + var6;
      return var7 | var8 | var9;
   }

   public static final int a(int var0, int var1, int var2) {
      int var3 = (var0 & 0xFF0000) * var1 / var2 & 0xFF0000;
      int var4 = (var0 & 0xFF00) * var1 / var2 & 0xFF00;
      int var5 = (var0 & 0xFF) * var1 / var2;
      return var3 | var4 | var5;
   }

   public final void a(int var1, int var2, int var3) throws Exception {
      this.aj = var2;
      this.ak = var3;
      if (this.aj == 3) {
         this.aj = 1;
      }

      if (this.ak == 3) {
         this.ak = 1;
      }

      this.j = this.h;

      try {
         this.f = new h("intro" + var1);
      } catch (Exception var5) {
      }

      this.af = e.d;
      if (this.f != null) {
         this.al = this.f.b;
         this.B = 0;
         this.ah = (super.X - this.f.b) / this.af;
      } else {
         this.al = 0;
         this.B = 16;
         this.ah = super.X / this.af;
      }

      this.m = a.a(a.a(215 + var1), super.W, e.a);
      this.ag = super.X - this.af;
      this.ai = 0;
      this.w = false;
      a.a.b();
      this.h = 3;
   }

   public final void a(String var1) {
      this.j = this.h;
      this.m = a.a(var1, super.W, e.a);
      this.B = 16;
      this.w = false;
      this.aj = 3;
      this.ak = 3;
      this.al = 0;
      this.af = e.d;
      this.ah = super.X / this.af;
      this.ag = super.X - this.af;
      this.ai = 0;
      a.a.b();
      this.h = 3;
   }

   public final void m() {
      if (this.w) {
         this.B--;
         if (this.B < 0) {
            this.B = 0;
            this.h = this.j;
            this.f = null;
            this.m = null;
            return;
         }
      } else {
         if ((this.aj != 2 || this.B >= 40) && (this.aj == 2 || this.B >= 16)) {
            this.ag--;
            if (this.ag < this.al) {
               this.ag = this.al + this.af - (this.al - this.ag);
               this.ai++;
            }
         } else {
            this.B++;
         }

         if (this.ai >= this.m.length || a.a.b(h)) {
            this.w = true;
            if (this.f != null || this.ai < this.m.length) {
               if (this.ak == 2) {
                  this.B = 40;
                  return;
               }

               this.B = 16;
               return;
            }

            this.B = 0;
         }
      }
   }

   public final void d(Graphics var1) {
      var1.setFont(e.a);
      var1.setColor(0);
      var1.fillRect(0, 0, super.W, super.X);
      if (this.f != null) {
         if (this.w || (this.aj != 2 || this.B < 40) && (this.aj == 2 || this.B < 16)) {
            if ((this.ak != 2 || !this.w) && (this.aj != 2 || this.w)) {
               if ((this.ak != 3 || !this.w) && (this.aj != 3 || this.w)) {
                  this.f.a(var1, 0, 0);
                  if (this.w) {
                     if (this.ak == 1 && this.B <= 16) {
                        a(var1, 0, 16 - this.B, 16, 0, this.f, 0, 0, super.W, super.X);
                     }
                  } else if (this.aj == 0) {
                     if (this.B <= 16) {
                        a(var1, 16777215, this.B, 16, 1, null, 0, 0, super.W, super.X);
                     }
                  } else if (this.aj == 1 && this.B <= 16) {
                     a(var1, 0, this.B, 16, 1, null, 0, 0, super.W, this.f.b);
                  }
               } else {
                  this.f.a(var1, 0, 0);
                  boolean var2 = false;
               }
            } else {
               a(var1, this.B, 40, 0, this.f, 0, 0, 2);
            }
         } else {
            this.f.a(var1, 0, 0);
         }
      }

      var1.setClip(0, 0, super.W, super.X);
      int var7 = this.B;
      if (this.w && this.ak == 2) {
         var7 -= 24;
         if (var7 < 0) {
            var7 = 0;
         }
      }

      int var3 = this.ag;

      for (int var4 = this.ai; var4 < this.ai + this.ah && var4 < this.m.length && var3 < super.X - this.af; var4++) {
         int var5 = this.af;
         if (var3 < this.al + this.af) {
            var5 = var3 - this.al;
         } else if (var3 + this.af > super.X - this.af) {
            var5 = super.X - this.af - var3;
         }

         int var6;
         if (var5 < this.af) {
            var6 = a((int)14672074, var5, (int)this.af);
         } else {
            var6 = 14672074;
         }

         if (this.w) {
            var6 = a(0, var6, var7, 16);
         }

         var1.setColor(var6);
         e.b(var1, this.m[var4], super.Y, var3 + 3, 17);
         var3 += this.af;
      }

      if (!this.w) {
         this.a(var1, h, 2, super.X);
      }
   }

   public final void e(Graphics var1) {
      if (this.A == 0) {
         var1.setColor(16777215);
         var1.fillRect(0, 0, super.W, super.X);
         a(var1, this.B, 40, 0, this.a, (super.W - this.a.a) / 2, (super.X - this.a.b) / 2, 4);
      } else if (this.A == 1) {
         var1.setColor(16777215);
         var1.fillRect(0, 0, super.W, super.X);
         a(var1, this.B, 40, 0, this.a, (super.W - this.a.a) / 2, (super.X - this.a.b) / 2, 4);
      } else if (this.A == 3) {
         var1.setColor(0);
         var1.fillRect(0, 0, super.W, super.X);
         a(var1, this.B, 40, 0, this.c, 0, 0, 1);
         var1.setClip(0, 0, super.W, super.X);
      } else {
         if (this.A == 4) {
            if (this.B >= 16) {
               if (this.b != null) {
                  this.c.a(var1, 0, 0);
                  if (this.M != -1) {
                     this.d.a(var1, 4 + this.M, 6);
                  }

                  this.b.a(var1, 0, 0);
               } else {
                  var1.setColor(0);
                  var1.fillRect(0, 0, super.W, super.X);
                  this.c.a(var1, 0, 0);
               }

               if (this.j && this.b != null) {
                  var1.setColor(16777215);
                  var1.setFont(e.b);
                  a(var1, a.a(59), super.Y, super.X - this.e.q - 1, 33, 16777215, 0);
                  return;
               }
            } else {
               if (this.b != null) {
                  this.b.a(var1, 0, 0);
               } else {
                  var1.setColor(0);
                  var1.fillRect(0, 0, super.W, super.X);
               }

               var1.setColor(0);
               var1.fillRect(0, 0, super.W, super.X);
               this.c.a(var1, 0, 0);
            }
         }
      }
   }

   public static final void a(Graphics var0, String var1, int var2, int var3, int var4, int var5, int var6) {
      var0.setColor(var6);
      var0.drawString(var1, var2 - 1, var3 - 1, var4);
      var0.drawString(var1, var2 - 1, var3 + 1, var4);
      var0.drawString(var1, var2 + 1, var3 + 1, var4);
      var0.drawString(var1, var2 + 1, var3 - 1, var4);
      var0.setColor(var5);
      var0.drawString(var1, var2, var3, var4);
   }

   public final void a(Graphics var1) {
      if (this.h == 4) {
         var1.setColor(16777215);
         var1.fillRect(0, 0, super.W, super.X);
         var1.setFont(e.b);
         var1.setColor(0);
         var1.drawString(a.a(58), super.W / 2, super.X / 2 - 1, 33);
         int var21;
         if ((var21 = super.X / 18) < 12) {
            var21 = 12;
         }

         int var28 = super.X / 2 + 1;
         var1.setColor(13553358);
         d.a(var1, 1, var28, super.W - 2, var21);
         var1.setColor(2370117);
         d.a(var1, 2, var28 + 2, this.U * (super.W - 6) / 100, var21 - 4);
      } else if (this.h == 2) {
         this.f(var1);
      } else if (this.h == 3) {
         this.d(var1);
      } else if (this.i) {
         this.c(var1);
      } else if (this.f) {
         if (this.B >= 16) {
            if (this.c != 11 && this.c != 10) {
               this.c(var1);
            } else {
               var1.setColor(0);
               var1.fillRect(0, 0, super.W, super.X);
            }
         } else {
            a(var1, 0, this.B, 16, this.C, null, 0, 0, super.W, super.X);
         }
      } else {
         if (this.h == 0) {
            this.e(var1);
         } else if (this.c == 14) {
            var1.setClip(0, 0, super.W, super.X);
            var1.setColor(0);
            var1.fillRect(0, 0, super.W, super.X);
         } else if (this.c == 10 && this.aG >= 1) {
            this.c(var1);
         } else if (this.c == 11 && !this.f) {
            String var20 = a.a(57);
            var1.setClip(0, 0, super.W, super.X);
            var1.setFont(e.b);
            var1.setColor(0);
            var1.fillRect(0, 0, super.W, super.X);
            if (this.b == 0) {
               var1.setColor(16777215);
               if (this.e != null) {
                  this.e.a(var1, super.Y, super.Z, 3);
                  e.b(var1, var20, super.Y, super.X - 2, 33);
               } else {
                  int var27 = super.Z - e.b.getHeight() / 2;
                  e.b(var1, var20, super.Y, var27, 17);
               }
            }
         } else {
            var1.setClip(0, 0, this.a, this.b);
            if (this.k < this.a || this.l < this.b) {
               var1.setColor(0);
               var1.fillRect(0, 0, this.a, this.b);
            }

            if (this.B) {
               int var2 = e.a() % 10;
               int var3 = e.a() % 4;
               var1.translate(var2, var3);
               this.b(var1);
               var1.translate(-var2, -var3);
            } else {
               this.b(var1);
            }

            int var14 = 0;

            for (int var22 = this.a.size(); var14 < var22; var14++) {
               c var4;
               if ((var4 = (c)this.a.elementAt(var14)).f == 3) {
                  this.g.a(var1, this.m + var4.n, this.n + var4.o);
               } else if (var4 != this.a) {
                  var4.a(var1, this.m, this.n);
               }
            }

            var14 = 0;

            for (int var23 = this.a.size(); var14 < var23; var14++) {
               ((c)this.a.elementAt(var14)).b(var1, this.m, this.n);
            }

            if (this.b != null) {
               var1.setColor(14745682);
               int var24 = 12 + this.ap / 4;
               int var29 = 24 - var24;
               int var5 = 0;

               for (int var6 = this.b.size(); var5 < var6; var5++) {
                  short[] var16;
                  int var7 = (var16 = (short[])this.b.elementAt(var5))[0] * 24 + this.m;
                  int var8 = var16[1] * 24 + this.n;
                  int var9 = var7 + 12;
                  int var10 = var8 + 12;
                  boolean var11 = false;
                  boolean var12 = false;
                  if (var5 != 0) {
                     short[] var13;
                     if ((var13 = (short[])this.b.elementAt(var5 - 1))[0] == var16[0] + 1) {
                        var1.fillRect(var7 + var29, var10 - this.aq, var24, this.ap);
                     } else if (var13[0] == var16[0] - 1) {
                        var1.fillRect(var7, var10 - this.aq, var24, this.ap);
                     } else if (var13[1] == var16[1] + 1) {
                        var1.fillRect(var9 - this.aq, var8 + var29, this.ap, var24);
                     } else if (var13[1] == var16[1] - 1) {
                        var1.fillRect(var9 - this.aq, var8, this.ap, var24);
                     }
                  }

                  if (var5 == var6 - 1) {
                     var1.setClip(0, 0, this.a, this.b);
                     this.b.a(var1, var9, var10, 3);
                  } else {
                     short[] var41;
                     if ((var41 = (short[])this.b.elementAt(var5 + 1))[0] == var16[0] + 1) {
                        var1.fillRect(var7 + var29, var10 - this.aq, var24, this.ap);
                     } else if (var41[0] == var16[0] - 1) {
                        var1.fillRect(var7, var10 - this.aq, var24, this.ap);
                     } else if (var41[1] == var16[1] + 1) {
                        var1.fillRect(var9 - this.aq, var8 + var29, this.ap, var24);
                     } else if (var41[1] == var16[1] - 1) {
                        var1.fillRect(var9 - this.aq, var8, this.ap, var24);
                     }
                  }
               }
            }

            if (this.a != null) {
               this.a.a(var1, this.m, this.n);
               this.a.b(var1, this.m, this.n);
            }

            if (this.c) {
               this.a.a(var1, this.m + 12, this.n + 12, 3);
            }

            var14 = 0;

            for (int var25 = this.c.size(); var14 < var25; var14++) {
               f var30;
               (var30 = (f)this.c.elementAt(var14)).a(var1, this.m, this.n + var30.r);
            }

            var1.setClip(0, 0, super.W, super.X);
            var14 = super.X - a;
            if (this.N > 0) {
               d.a(var1, 0, var14, this.a, a, 14);
               var1.setClip(0, 0, super.W, super.X);
            }

            int var26 = a - 24 >> 1;
            int var31 = 24 + var26 * 2;
            int var32 = super.W - var31;
            var14 += this.N;
            if (this.t) {
               this.t = false;
               d.a(var1, 0, var14, var32 + 1, a, 0, 2370117, b[this.j[this.f]], this.N, a);
               int var33 = super.X - a / 2 + this.N;
               if (this.b == 1) {
                  int var36 = var32 / 2;
                  this.p.a(var1, 0, var36, var33, 6);
                  e.a(var1, this.a((int)-1, -1, this.f) - this.a((int)10, -1, this.f) + "/" + this.g, var36 + this.p.p + 1, var33, 1, 6);
               }

               int var37 = 10;
               if (this.a <= 120) {
                  var37 = 4;
               }

               this.p.a(var1, 1, var37, var33, 6);
               var37 += this.p.p + 1;
               if (this.l[this.f] != 1) {
                  e.a(var1, "- - -", var37, var33, 1, 6);
               } else {
                  e.a(var1, "" + this.f[this.f], var37, var33, 1, 6);
               }

               var1.setClip(0, 0, super.W, super.X);
            }

            if (this.u) {
               this.u = false;
               if (var26 > 0) {
                  this.a(var1, var32, var14, var31, a);
               }

               int var34 = var32 + var26;
               int var39 = var14 + var26;
               this.d[this.b[this.q][this.r]].a(var1, var34, var39);
               String var40 = "." + f[this.a(this.q, this.r)];
               e.a(var1, var40, var34 + 24, var39 + 24, 0, 40);
               if (var26 == 0) {
                  var1.setColor(0);
                  var1.drawRect(var34, var39, 24, 24);
               }
            }

            if (this.c == 6 && this.a[this.u].f != 4) {
               int var35 = 0;
               if (this.r * 24 <= this.b / 2 - 24) {
                  var35 = this.b - this.e.q - this.ao + 2;
               }

               this.a(var1, this.a, this.a[this.u], var35);
            }
         }

         if (this.a()) {
            if (this.d) {
               this.a(var1, i, 1, this.b);
            }

            if (this.e) {
               this.a(var1, h, 0, this.b);
            }

            if (this.h == 1 && (this.l[this.f] == 0 || this.c == 0) && this.c != 11) {
               this.a(var1, h, 3, this.b);
            }
         }

         if (this.n || this.o) {
            a(var1, 0, this.O, 16, this.n ? 0 : 1, null, 0, 0, super.W, super.X);
         }
      }
   }

   public final void a(Graphics var1, int var2, int var3, int var4, int var5) {
      var1.setColor(4344163);
      var1.fillRect(var2, var3, var4, var5);
      var1.setColor(11384493);
      var1.fillRect(var2 + 1, var3 + 1, var4 - 2, var5 - 2);
      var1.setColor(4344163);
      var1.fillRect(var2 + 3, var3 + 3, var4 - 6, var5 - 6);
   }

   public final void a(Graphics var1, c var2, c var3, int var4) {
      int var5 = this.ao - 2;
      var1.setColor(11384493);
      var1.fillRect(0, var4, this.a, var5);
      var1.setColor(0);
      var1.fillRect(0, var5 + var4, this.a, 2);
      boolean var6 = false;
      int var7 = 0;
      int var9;
      int var10 = (var9 = var5 / 2) + var4;

      for (int var13 = 0; var13 < 3; var13++) {
         this.o.a(var1, var13, var7 + 1, var10, 6);
         var7 += this.o.p + 2;
         int var8 = var4 + 1;
         int var11;
         if (var13 == 0) {
            if (super.W <= 132) {
               var11 = 56;
            } else {
               var11 = 61 * this.a / 176;
            }
         } else if (var13 == 1) {
            if (super.W <= 132) {
               var11 = 28;
            } else {
               var11 = 47 * this.a / 176;
            }
         } else {
            var11 = this.a - var7;
         }

         for (int var14 = 0; var14 < 2; var14++) {
            c var15;
            c var16;
            if (var14 == 0) {
               var15 = var2;
               var16 = var3;
            } else {
               var15 = var3;
               var16 = var2;
            }

            int var12 = var5 / 2 - 2;
            var1.setColor(2172994);
            var1.fillRect(var7, var8, var11, var12);
            int var17 = var7 + 1;
            if (var13 == 0 || super.W > 132) {
               var1.setColor(b[this.j[var15.e]]);
               var1.fillRect(var17, var8 + 1, 3, var12 - 2);
               var17 += 4;
            }

            int var18 = 0;
            String var19 = null;
            if (var13 == 0) {
               if (var14 != 0 && !var3.a(var2, var2.c, var2.d)) {
                  var19 = "0-0";
               } else {
                  var18 = var15.a(var16);
                  var19 = var15.d + var18 + "-" + (var15.e + var18);
               }
            } else if (var13 == 1) {
               var18 = var15.b(var16);
               var19 = "" + (var15.f + var18);
            } else {
               var19 = "" + var15.a;
            }

            e.a(var1, var19, var17, var8 + 1, 0);
            if (var18 > 0) {
               this.u.a(var1, 1, var17 + 1 + e.a((byte)0, var19), var8 + var12 / 2, 6);
            } else if (var18 < 0) {
               this.u.a(var1, 2, var17 + 1 + e.a((byte)0, var19), var8 + var12 / 2, 6);
            }

            int var20 = var7 + var11 - 2;
            if (var13 == 0 && (var15.g & 2) != 0) {
               this.j.a(var1, 1, var20, var8 + var12 / 2, 10);
               var20 -= this.j.p;
            }

            if ((var13 == 0 || var13 == 1) && (var15.g & 1) != 0) {
               this.j.a(var1, 0, var20, var8 + var12 / 2, 10);
            }

            var8 += var9;
         }

         var7 += var11;
      }
   }

   public final void a(Graphics var1, int var2, int var3, int var4) {
      int var5 = 0;
      byte var6 = 0;
      if (var2 == 1024) {
         var6 = 36;
      } else if (var2 == 2048) {
         var5 = super.W;
         var6 = 40;
      }

      this.e.a(var1, var3, var5, var4, var6);
   }

   public final c a(int var1, int var2, byte var3) {
      int var6 = 0;

      for (int var7 = this.a.size(); var6 < var7; var6++) {
         int var4;
         int var5;
         c var8;
         if ((var8 = (c)this.a.elementAt(var6)).f == 1) {
            var4 = var8.b;
            var5 = var8.c;
         } else {
            var4 = var8.c;
            var5 = var8.d;
         }

         if (var1 == var4 && var2 == var5) {
            if (var3 == 0) {
               if (var8.f != 3) {
                  return var8;
               }
            } else if (var3 == 1 && var8.f == 3) {
               return var8;
            }
         }
      }

      return null;
   }

   public final byte a(int var1, int var2) {
      return this.h[this.b[var1][var2]];
   }

   public final void n() {
      e.f();
      this.y = 0;
      this.N = 0;
      this.c = 8;
      this.d = this.c;
   }

   public final void o() {
      this.d[this.f][0] = (byte)this.q;
      this.d[this.f][1] = (byte)this.r;
      this.a++;
      this.f = (byte)((this.f + 1) % this.e);
      if (this.l[this.f] == 2) {
         this.o();
      } else {
         for (int var1 = this.a.size() - 1; var1 >= 0; var1--) {
            c var2;
            if ((var2 = (c)this.a.elementAt(var1)).f == 3) {
               if (var2.d != 9 && --var2.h <= 0) {
                  var2.a();
               }
            } else {
               var2.f = 0;
               if ((var2.g & 1) != 0 && var2.i == this.f) {
                  var2.c((byte)1);
               }

               if (var2.e == this.f) {
                  var2.c((byte)2);
               }

               var2.l = 0;
            }
         }

         this.ar = 0;

         for (int var3 = 0; var3 < this.b.length; var3++) {
            for (int var5 = 0; var5 < this.b[var3].length; var5++) {
               if (this.b(var3, var5, this.f)) {
                  if (this.a(var3, var5) == 8) {
                     this.ar += 30;
                  } else if (this.a(var3, var5) == 9) {
                     this.ar += 50;
                  }
               }
            }
         }

         this.f[this.f] = this.f[this.f] + this.ar;

         for (int var4 = 0; var4 < this.e.length; var4++) {
            this.j[var4] = 0;
         }

         if (this.l[this.f] == 1) {
            this.e(this.d[this.f][0], this.d[this.f][1]);
         }

         this.h = true;
         this.t = true;
         if (this.l[this.f] == 0) {
            this.p();
         } else {
            c.c = c.b;
         }

         if (this.a((int)-1, 0, this.f) <= 0 && this.e(this.f) == 0) {
            this.o();
         }
      }
   }

   public final boolean a(int var1, int var2, c var3) {
      return var3.a((short)8) && this.a(var3.c, var3.d) == 8 && this.b[var3.c][var3.d] < this.j;
   }

   public final boolean b(int var1, int var2, c var3) {
      return var3.a((short)8) && this.a(var3.c, var3.d) == 8 && this.b[var3.c][var3.d] >= this.j && !this.a(var3.c, var3.d, this.k[var3.e])
         ? true
         : var3.a((short)16) && this.a(var3.c, var3.d) == 9 && !this.a(var3.c, var3.d, this.k[var3.e]);
   }

   public final void a(byte var1, int var2, int var3) {
      this.b[var2][var3] = var1;
   }

   public final void b(int var1, int var2, int var3) {
      if (this.b[var1][var2] >= this.j) {
         this.a((byte)(this.j + var3 * 2 + (this.b[var1][var2] - this.j) % 2), var1, (int)var2);
      }
   }

   public final int a(int var1, int var2) {
      return this.a(var1, var2, this.b);
   }

   public final int a(int var1, int var2, byte[][] var3) {
      return var3[var1][var2] >= this.j ? (var3[var1][var2] - this.j) / 2 : -1;
   }

   public final int d(int var1) {
      return var1 != -1 && var1 != 0 ? this.i[var1] : -1;
   }

   public final boolean a(int var1, int var2, int var3) {
      int var4;
      return (var4 = this.d(this.a(var1, var2))) > -1 ? var3 == this.k[var4] : false;
   }

   public final boolean b(int var1, int var2, int var3) {
      return this.a(var1, var2) == this.j[var3];
   }

   public final int e(int var1) {
      int var2 = 0;

      for (int var3 = 0; var3 < this.aw; var3++) {
         if (this.b(this.f[var3][0], this.f[var3][1], var1)) {
            var2++;
         }
      }

      return var2;
   }

   public final int a(int var1, int var2, byte var3) {
      int var5 = 0;
      int var6 = 0;

      for (int var7 = this.a.size(); var6 < var7; var6++) {
         c var4 = (c)this.a.elementAt(var6);
         if ((var1 == -1 || var4.d == var1) && (var2 == -1 && var4.f != 3 || var2 == var4.f) && (var3 == -1 || var4.e == var3)) {
            var5++;
         }
      }

      return var5;
   }

   public final c[] a(int var1, int var2, byte var3) {
      Vector var4 = new Vector();
      int var6 = 0;

      for (int var7 = this.a.size(); var6 < var7; var6++) {
         c var5 = (c)this.a.elementAt(var6);
         if ((var1 == -1 || var5.d == var1) && (var2 == -1 && var5.f != 3 || var2 == var5.f) && (var3 == -1 || var5.e == var3)) {
            var4.addElement(var5);
         }
      }

      c[] var8 = new c[var4.size()];
      var4.copyInto(var8);
      return var8;
   }

   public static final void a(Graphics var0, int var1, int var2, int var3, h var4, int var5, int var6, int var7) {
      int var8;
      int var9;
      if (var3 == 0) {
         var8 = var4.a;
         var9 = var4.b;
      } else {
         var8 = var4.b;
         var9 = var4.a;
      }

      int var10 = var8 / 2;
      int var11 = var9 / 1;
      int var12 = var8 * var1 / var2;
      int var13 = var8 * (var2 - var1) / (var2 * 4);
      int var15 = 360 * var1 / var2;
      int var16 = 360 * var7 / var11;

      for (int var17 = 0; var17 < var11; var17++) {
         int var14 = var13 * a.a(var15) >> 10;
         if (var3 == 0) {
            var0.setClip(var5 + var10 - var12 / 2 + var14, var6 + var17 * 1, var12, 1);
            var4.a(var0, var5 + var14, var6);
         } else {
            var0.setClip(var5 + var17 * 1, var6 + var10 - var12 / 2 + var14, 1, var12);
            var4.a(var0, var5, var6 + var14);
         }

         var15 += var16;
      }
   }

   public static final void a(Graphics var0, int var1, int var2, int var3, int var4, h var5, int var6, int var7, int var8, int var9) {
      int var10 = var8 / 8 + 1;
      int var11 = var9 / 1;
      int var12 = var3 - 7;

      for (int var13 = 0; var13 < 8; var13++) {
         int var18;
         if ((var18 = var2 - var13 * 1) < 0) {
            var18 = 0;
         }

         int var15;
         if (var18 >= var12) {
            boolean var14 = false;
            var15 = var10;
         } else {
            var15 = var10 * var18 / var12;
         }

         int var19;
         if (var4 == 1) {
            var19 = var13 * var10 + var15;
            var15 = var10 - var15;
         } else {
            var19 = var13 * var10;
         }

         int var20 = 255 * var15 / var10;
         e.a(var0, var20 << 24 | var1);

         for (int var21 = 0; var21 < 1; var21++) {
            var0.fillRect(var6 + var19, var7, var15, var11);
         }
      }
   }

   public final boolean a(byte var1, int var2, int var3) {
      if (this.g > this.a((int)-1, -1, this.f) - this.a((int)10, -1, this.f) && var1 <= this.I && c.a[var1] <= this.f[this.f] && c.a[var1] > 0) {
         this.a(this.c, 0);
         return c.a(this.c, var2, var3, c.a[var1], -1, var1, this.f, true);
      } else {
         return false;
      }
   }

   public final boolean a(c var1, int var2, int var3) {
      if (this.g > this.a((int)-1, -1, this.f) - this.a((int)10, -1, this.f) && (var1.d <= this.I || var1.d == 9) && var1.k <= this.f[this.f]) {
         this.a(this.c, 0);
         return c.a(this.c, var2, var3, c.a[var1.d], -1, var1.d, this.f, true);
      } else {
         return false;
      }
   }

   public final void p() {
      c[] var1 = this.a((int)-1, 0, this.f);
      this.f = new Vector(var1.length);

      for (int var2 = 0; var2 < var1.length; var2++) {
         int var3;
         for (var3 = 0; var3 < var2; var3++) {
            c var4 = (c)this.f.elementAt(var3);
            byte var5 = o[var4.d];
            byte var6;
            if ((var6 = o[var1[var2].d]) < var5 || var6 == var5 && var1[var2].g < var4.g) {
               this.f.insertElementAt(var1[var2], var3);
               break;
            }
         }

         if (var3 == var2) {
            this.f.addElement(var1[var2]);
         }
      }

      this.d = new c[this.e.length];
      this.p = new byte[this.e.length];
      c.c = c.a;
      this.au = 0;
      this.k = 0;
   }

   public final void q() throws Exception {
      if (a.a.a(h)) {
         this.a(this.b, this.d, this.b, this);
         a.a.b();
      } else if (!this.x) {
         if (this.k == 4) {
            if (this.j == null && this.k == null) {
               if (this.b(this.a.c, this.a.d, this.a)) {
                  int var16 = this.b(this.a.c, this.a.d);
                  if (this.aA != -1 && this.aA != var16) {
                     this.d[this.aA] = this.d[var16];
                     this.d[var16] = this.a;
                  }

                  this.b(this.a.c, this.a.d, this.j[this.a.e]);
                  a.a.a(this.a(null, a.a(73), this.b, 1000));
                  e.b(9, 1);
                  this.c = 9;
                  this.d = this.c;
               } else if (this.a(this.a.c, this.a.d, this.a)) {
                  int var17 = this.b(this.a.c, this.a.d);
                  if (this.aA != -1 && this.aA != var17) {
                     this.d[this.aA] = this.d[var17];
                     this.d[var17] = this.a;
                  }

                  this.a((byte)this.j, this.a.c, this.a.d);
                  a.a.a(this.a(null, a.a(74), this.b, 1000));
                  e.b(9, 1);
                  this.c = 0;
                  this.d = this.c;
               } else {
                  this.c = 0;
               }

               this.a.d();
               this.a = null;
               this.k = 0;
            } else {
               this.k = 5;
               this.a.a(this.c, this.a.c, this.a.d);
               this.b = true;
               this.a = true;
               this.j = this.c;
               if (this.j != null) {
                  this.a.a(a[1]);
                  this.e(this.j.c, this.j.d);
               } else if (this.k != null) {
                  this.e(this.k.c, this.k.d);
               }
            }

            this.c = true;
         } else {
            if (this.k == 5) {
               if (this.c - this.j >= 500L) {
                  if (this.j != null) {
                     this.a(this.a, this.j);
                  } else if (this.k != null) {
                     this.a(this.k, this.f);
                     this.k = null;
                     this.k = 7;
                     this.a.d();
                  }

                  this.a = false;
                  this.b = false;
                  return;
               }
            } else if (this.k == 7) {
               if (this.d == null) {
                  this.k = 0;
                  this.c = 0;
                  return;
               }
            } else if (this.k == 6) {
               if (this.c - this.j >= 1000L) {
                  this.j = null;
                  this.k = 0;
                  this.c = 0;
                  return;
               }
            } else {
               if (this.k == 2) {
                  return;
               }

               if (this.k == 3) {
                  if (this.au == 0) {
                     if (this.a(this.a.n + 12, this.a.o + 12)) {
                        if (this.b == 0 && this.s == 7 && this.a == this.b[1]) {
                           this.i = null;
                           c[] var15;
                           if ((var15 = this.a((int)-1, -1, (byte)0)).length > 0) {
                              this.a(var15[e.a(var15.length)]);
                           }

                           this.k = 4;
                           return;
                        }

                        this.au = 1;
                        this.j = this.c;
                        return;
                     }
                  } else if (this.au == 1) {
                     if (this.c - this.j >= 100L) {
                        this.a = true;
                        this.b = false;
                        this.au = 2;
                        this.c = 1;
                        this.j = this.c;
                        return;
                     }
                  } else if (this.au == 2) {
                     if (this.c - this.j >= 200L) {
                        this.q = this.as;
                        this.r = this.at;
                        this.a.b(this.as * 24, this.at * 24);
                        this.b = this.a.a(this.a.c, this.a.d, this.q, this.r);
                        this.au = 3;
                        this.j = this.c;
                        return;
                     }
                  } else if (this.au == 3 && this.c - this.j >= 200L) {
                     this.b = null;
                     this.a.a(this.as, this.at, true);
                     this.k = 2;
                     this.au = 0;
                     this.c = 2;
                  }

                  return;
               }

               if (this.f.size() == 0) {
                  c var14 = null;
                  int var2 = 0;
                  int var3 = 6666;
                  byte var4 = 0;
                  byte var5 = 0;

                  for (int var6 = 0; var6 < this.e.length; var6++) {
                     byte var7 = this.e[var6][0];
                     byte var8 = this.e[var6][1];
                     if (this.a((int)var7, (int)var8) == 9 && this.b(var7, var8, this.f)) {
                        if (var2 == 0) {
                           var4 = var7;
                           var5 = var8;
                        }

                        var2++;
                        int var9 = 0;

                        for (int var10 = this.a.size() - 1; var10 >= 0; var10--) {
                           c var11 = (c)this.a.elementAt(var10);
                           if (this.k[var11.e] != this.k[this.f] && var11.a((short)16)) {
                              int var12;
                              if ((var12 = Math.abs(var11.c - var7) + Math.abs(var11.d - var8)) < var3) {
                                 var3 = var12;
                                 var4 = var7;
                                 var5 = var8;
                              }

                              var9++;
                           }
                        }

                        if (var9 == 0) {
                           for (int var24 = 0; var24 < this.e.length; var24++) {
                              byte var27 = this.e[var24][0];
                              byte var28 = this.e[var24][1];
                              int var13;
                              if (this.a((int)var27, (int)var28) == 9
                                 && !this.b(var27, var28, this.f)
                                 && (var13 = Math.abs(var27 - var7) + Math.abs(var28 - var8)) < var3) {
                                 var3 = var13;
                                 var4 = var7;
                                 var5 = var8;
                              }
                           }
                        }
                     }
                  }

                  if (var2 > 0) {
                     for (int var18 = 0; var18 < this.e[this.f]; var18++) {
                        if (this.a[this.f][var18] != null && this.a[this.f][var18].f == 3 && this.a(this.a[this.f][var18], var4, var5)) {
                           var14 = this.a(this.a[this.f][var18], var4, var5);
                        }
                     }

                     if (var14 == null) {
                        if (this.a((int)0, -1, this.f) < 2 && this.a((byte)0, var4, var5)) {
                           var14 = this.a((byte)0, var4, var5);
                        } else if (this.a((int)1, -1, this.f) < 2 && this.a((byte)1, var4, var5)) {
                           var14 = this.a((byte)1, var4, var5);
                        } else {
                           int var19 = 0;
                           int var20 = 0;

                           for (byte var21 = 0; var21 < this.e; var21++) {
                              if (this.k[var21] == this.k[this.f]) {
                                 var19 += this.a((int)-1, -1, var21);
                              } else {
                                 var20 += this.a((int)-1, -1, var21);
                              }
                           }

                           if (this.f[this.f] >= 1000 || this.a((int)-1, -1, this.f) < 8 || var19 < var20) {
                              int var22 = 0;
                              byte[] var23 = new byte[12];

                              for (byte var25 = 1; var25 < 12; var25++) {
                                 if ((this.a(var25, -1, this.f) < 1 || c.a[var25] >= 600) && this.a(var25, var4, var5)) {
                                    var23[var22] = var25;
                                    var22++;
                                 }
                              }

                              if (var22 > 0) {
                                 byte var26 = var23[Math.abs(e.a()) % var22];
                                 var14 = this.a((byte)var26, var4, var5);
                              }
                           }
                        }
                     }
                  }

                  if (var14 != null) {
                     this.e(var14);
                     return;
                  }

                  this.c = null;
                  this.f = null;
                  this.n();
                  return;
               }

               if (this.b == 0 && this.s == 7 && this.b[1].f != 2) {
                  this.a = this.b[1];
                  this.e(this.a.c, this.a.d);
                  this.i = this.a;
                  this.k = 3;
                  this.f.removeElement(this.a);
                  return;
               }

               c var1 = this.l;
               if (this.l == null) {
                  var1 = (c)this.f.elementAt(0);
               }

               this.e(var1);
               if (this.l == null) {
                  this.f.removeElement(var1);
               }
            }
         }
      }
   }

   public final void e(c var1) {
      this.a = var1;
      this.c = true;
      this.a(this.c, 0);
      this.a.b(this.c);
      this.a = false;
      this.c = this.a((int)0, -1, this.f);
      int var2 = 0;
      int var3 = this.b.length + this.c.length + this.e.length;
      this.a = new int[var3][5];
      this.av = 0;
      boolean var4 = false;
      int var5 = 10000;
      this.ax = -1;
      this.ay = -1;
      this.az = -1;
      this.aA = -1;

      for (int var6 = 0; var6 < this.c.length + this.b.length; var6++) {
         c var7 = null;
         if (var6 >= this.c.length) {
            if ((var7 = this.b[var6 - this.c.length]) != null) {
               if (var7.f == 3) {
                  var7 = null;
               } else if (this.k[var7.e] != this.k[this.f] && this.b[this.f] == null) {
                  this.a[var2][2] = this.a[var2][2] + var7.a(var7.c, var7.d, null) * 2;
               } else if (this.a >= 15 && this.k[var7.e] != this.k[this.f] && this.a((int)-1, -1, var7.e) < 4 && this.a((int)-1, -1, this.f) >= 8) {
                  this.a[var2][2] = this.a[var2][2] + var7.a(var7.c, var7.d, null) * 2;
               } else if (var7.e != this.f) {
                  var7 = null;
               }
            }
         } else if (this.b[this.f] != null) {
            var7 = this.c[var6];
         }

         if (var7 == null) {
            this.a[var2][2] = -6666;
         } else {
            this.a[var2][0] = var7.c;
            this.a[var2][1] = var7.d;
            if (var7.e == this.f) {
               c[] var8 = var7.a(var7.c, var7.d, 1, 5, (byte)0);

               for (int var9 = 0; var9 < var8.length; var9++) {
                  if (var8[var9].f != 4) {
                     this.a[var2][2] = this.a[var2][2] + var8[var9].a(var8[var9].c, var8[var9].d, var7);
                  }
               }
            }

            if (this.a[var2][2] > 0) {
               this.a[var2][4] = this.a[var2][4] + var7.a(var7.c, var7.d, null);
               this.a[var2][4] = this.a[var2][4] + var7.l;
               if (this.a[var2][2] > this.av) {
                  this.av = this.a[var2][2];
               }

               this.a[var2][3] = Math.abs(var7.c - var1.c) + Math.abs(var7.d - var1.d);
               if (this.a[var2][3] < 1) {
                  this.a[var2][3] = 1;
               }

               if (this.a[var2][3] < var5) {
                  var5 = this.a[var2][3];
               }
            } else {
               this.a[var2][2] = -6666;
            }
         }

         var2++;
      }

      int var19 = 666;
      int var20 = 666;
      int var21 = -1;
      int var22 = -1;

      for (int var10 = 0; var10 < this.e.length; var10++) {
         byte var11 = this.e[var10][0];
         byte var12 = this.e[var10][1];
         byte var13 = this.a((int)var11, (int)var12);
         boolean var14 = this.b(var11, var12, var1.e);
         this.a[var2][2] = -6666;
         if (var14 || this.d[var10] != null) {
            c[] var15 = var1.a(var11, var12, 1, 5, (byte)0);
            this.a[var2][0] = var11;
            this.a[var2][1] = var12;
            this.a[var2][2] = 0;

            for (int var16 = 0; var16 < var15.length; var16++) {
               if (var15[var16].f != 4) {
                  if (this.d[var10] != null && !var14) {
                     this.a[var2][2] = this.a[var2][2] + var15[var16].a(var15[var16].c, var15[var16].d, null);
                  } else if (var13 == 8 && var15[var16].a((short)8) || var13 == 9 && var15[var16].a((short)16)) {
                     this.a[var2][2] = this.a[var2][2] + var15[var16].a(var15[var16].c, var15[var16].d, null);
                  }
               }
            }

            if (this.a[var2][2] == 0) {
               if (this.d[var10] != null && !var14) {
                  this.a[var2][2] = 100;
                  this.a[var2][4] = this.a[var2][4] + 2000;
               } else {
                  this.a[var2][2] = -6666;
               }
            }

            if (this.a[var2][2] != -6666) {
               this.a[var2][4] = this.a[var2][4] + this.j[var10];
               if (this.a[var2][2] > this.av) {
                  this.av = this.a[var2][2];
               }

               this.a[var2][3] = Math.abs(var11 - var1.c) + Math.abs(var12 - var1.d);
               if (this.a[var2][3] < 1) {
                  this.a[var2][3] = 1;
               }

               if (this.a[var2][3] < var5) {
                  var5 = this.a[var2][3];
               }
            }
         }

         if (this.a(var11, var12, this.k[var1.e])) {
            c var33;
            int var36;
            if (((var33 = this.a(var11, var12, (byte)0)) == null || var33.e == var1.e) && (var36 = Math.abs(var11 - var1.c) + Math.abs(var12 - var1.d)) < var20
               )
             {
               var22 = var10;
               var20 = var36;
            }
         } else if ((this.d[var10] == null || this.d[var10] == var1) && (var13 == 8 && var1.a((short)8) || var13 == 9 && var1.a((short)16))) {
            int var34;
            if ((var34 = Math.abs(var11 - var1.c) + Math.abs(var12 - var1.d)) < var19) {
               var21 = var10;
               var19 = var34;
            }

            c var37 = this.a(var11, var12, (byte)0);
            if (var34 < var20 && this.c[var11][var12] > 0 && (var37 == null || var37.e == var1.e)) {
               var22 = var10;
               var20 = var34;
            }
         }

         var2++;
      }

      if (var1.g < 50 && var22 != -1) {
         if (var22 == var21) {
            this.aA = var21;
         }

         this.d[var22] = var1;
         this.ax = this.e[var22][0];
         this.ay = this.e[var22][1];
         this.a(this.g, 0);
         c.a(this.g, this.ax, this.ay, 10, -1, var1.d, this.f, false);
      } else if (this.b[this.f] == null || var21 == -1 || !var1.a((short)8) && !var1.a((short)16)) {
         int var23 = -1;
         int var25 = -6666;

         for (int var28 = 0; var28 < var2; var28++) {
            if (this.a[var28][2] > -6666) {
               if (this.a[var28][2] > 0) {
                  this.a[var28][2] = this.a[var28][2] * var5 / this.a[var28][3];
               }

               this.a[var28][2] = this.a[var28][2] - this.a[var28][4];
               if (this.a[var28][2] > var25) {
                  var25 = this.a[var28][2];
                  var23 = var28;
               }
            }
         }

         if (var23 != -1) {
            int var29 = var1.a(var1.c, var1.d, null);
            if (var23 < this.c.length) {
               this.c[var23].l += var29;
            } else if (var23 < this.b.length + this.c.length) {
               this.b[var23 - this.c.length].l += var29;
            } else {
               this.az = var23 - this.b.length - this.c.length;
               this.j[this.az] = this.j[this.az] + var29;
            }

            this.ax = this.a[var23][0];
            this.ay = this.a[var23][1];
            this.a(this.g, 0);
            c.a(this.g, this.ax, this.ay, 10, -1, var1.d, this.f, false);
         }
      } else {
         this.aA = var21;
         this.d[var21] = var1;
         this.ax = this.e[var21][0];
         this.ay = this.e[var21][1];
         this.a(this.g, 0);
         c.a(this.g, this.ax, this.ay, 10, -1, var1.d, this.f, false);
      }

      int var24 = -10000;
      int var26 = 0;

      for (int var30 = this.c.length; var26 < var30; var26++) {
         int var31 = 0;

         for (int var32 = this.c[var26].length; var31 < var32; var31++) {
            c var35;
            if (this.c[var26][var31] > 0
               && ((var35 = this.a((int)var26, var31, (byte)0)) == null || var35 == var1 || this.l == null && var35.e == var1.e && var35.f == 0)) {
               if (!var1.a((short)512) || var35 == var1) {
                  c[] var17 = var1.a(var26, var31, (byte)0);

                  for (int var18 = 0; var18 < var17.length; var18++) {
                     int var38;
                     if ((var38 = this.a(var1, var26, var31, var17[var18], null)) > var24) {
                        this.k = null;
                        this.j = var17[var18];
                        var24 = var38;
                        this.as = var26;
                        this.at = var31;
                     }
                  }
               }

               if (var1.a((short)32)) {
                  this.a = var1.a(var26, var31, (byte)1);

                  for (int var41 = 0; var41 < this.a.length; var41++) {
                     int var39;
                     if ((var39 = this.a(var1, var26, var31, null, this.a[var41])) > var24) {
                        this.j = null;
                        this.k = this.a[var41];
                        var24 = var39;
                        this.as = var26;
                        this.at = var31;
                     }
                  }
               }

               int var40;
               if ((var40 = this.a(var1, var26, var31, null, null)) > var24) {
                  this.j = null;
                  this.k = null;
                  var24 = var40;
                  this.as = var26;
                  this.at = var31;
               }
            }
         }
      }

      if (this.aA != -1) {
         this.p[this.aA] = (byte)(10 - this.g[this.as][this.at]);
      }

      this.l = null;
      c var27;
      if ((var27 = this.a((int)this.as, this.at, (byte)0)) != null && var27 != var1) {
         this.l = var27;
         this.k = 0;
      } else {
         this.e(var1.c, var1.d);
         this.i = var1;
         this.k = 3;
      }
   }

   public final int a(c var1, int var2, int var3, c var4, c var5) {
      int var6 = 0;
      if (this.aA != -1 && this.b[var1.e] != null) {
         if (this.ax != -1) {
            if (this.g[var2][var3] > 0) {
               var6 = 0 + 100 + 100 * this.g[var2][var3] / 10;
            } else {
               int var7 = Math.abs(this.ax - var1.c) + Math.abs(this.ay - var1.d);
               int var8 = Math.abs(this.ax - var2) + Math.abs(this.ay - var3);
               var6 = 0 + 100 * (var7 - var8) / (c.a[var1.d] - 1);
               if (g[this.a(var2, var3)] <= 1) {
                  var6 += 20;
               }
            }
         }

         if (var4 == null && !this.a((int)var2, var3, (int)this.k[var1.e])) {
            if (var1.a((short)16) && this.a(var2, var3) == 9) {
               var6 += 300;
            } else if (var1.a((short)8) && (this.a(var2, var3) == 8 || this.b[var2][var3] == 27)) {
               var6 += 200;
            }
         }
      }

      switch (var1.d) {
         case 2:
            if (this.a(var2, var3) == 5) {
               var6 += 25;
            }
            break;
         case 3:
            if (var5 != null) {
               var6 += 100;
            }
            break;
         case 4:
            c[] var12 = var1.a(var2, var3, 1, 2, (byte)2);
            if (var5 != null) {
               var6 += 25 * var12.length;
            }
         case 5:
         case 6:
         case 7:
         case 8:
         case 9:
      }

      if (var4 != null) {
         if (var4.f == 4) {
            int var13 = this.a(var4.c, var4.d);
            int var15 = this.b(var4.c, var4.d);
            if (var13 != 0 && var15 != -1 && this.d[var15] == null) {
               var6 += var1.a(var2, var3, var4) / 2;
            }
         } else {
            if (!var4.a(var1, var2, var3)) {
               var6 += var1.a(var2, var3, var4) * 2;
            } else {
               var6 += var1.a(var2, var3, var4) * 3 / 2 - var4.a(var2, var3, var1);
            }

            if (var4.d == 9) {
               var6 += 25;
            } else if (var4.d == 11) {
               var6 += 100;
            }
         }
      }

      var6 += f[this.a(var2, var3)];
      if (var1.g < 100 && this.a((int)var2, var3, (int)this.k[var1.e])) {
         var6 += 100 - var1.g;
      }

      int var14 = this.b(var2, var3);
      if (this.g[var2][var3] > 0) {
         int var16 = this.g[var2][var3];
         int var9 = 10 - c.a[var1.d] / 2;
         if (var16 > var9) {
            var16 = var9;
         }

         var6 += 50 + 100 * var16 / var9;
      } else if (this.ax != -1) {
         int var17 = Math.abs(this.ax - var1.c) + Math.abs(this.ay - var1.d);
         int var19 = Math.abs(this.ax - var2) + Math.abs(this.ay - var3);
         var6 += 50 * (var17 - var19) / (c.a[var1.d] - 1);
      }

      c var18;
      if (var14 != -1 && (var18 = this.d[var14]) != null && var18 != var1 && var18.f == 0 && this.p[var14] < c.a[var18.d]) {
         var6 -= 200;
      }

      int var11;
      return var11 = var6 + 20 * (Math.abs(var2 - var1.c) + Math.abs(var3 - var1.d)) / (c.a[var1.d] - 1);
   }

   public final int b(int var1, int var2) {
      for (int var3 = 0; var3 < this.e.length; var3++) {
         if (this.e[var3][0] == var1 && this.e[var3][1] == var2) {
            return var3;
         }
      }

      return -1;
   }

   public final void c(int var1) {
      this.aB = var1;
      this.y = true;
   }

   public final d a(String var1, byte var2, byte var3) {
      d var4 = new d((byte)7, 12);
      int var5 = e.b * 3;
      var4.a(var1, super.W, var5, var2, var3);
      var4.a(0, super.X - var5, 0);
      a.a.a(var4);
      return var4;
   }

   public final d a(String var1, String var2, int var3, int var4) {
      return this.a(var1, var2, var3, -1, var4);
   }

   public final d a(String var1, String var2, int var3, int var4, int var5) {
      d var6;
      (var6 = new d((byte)10, 12)).a(var1, var2, super.W, var4);
      var6.a(super.Y, var3 / 2, 3);
      var6.a = this;
      var6.v = var5;
      return var6;
   }

   public final void r() throws Exception {
      this.q = null;
      if (this.b == 0) {
         this.N = a;
         this.m = true;
         this.l = false;
         this.G = this.a(null, this.b, super.X, 2000);
         this.G.a(super.Y, super.Z, 3);
         this.p = true;
         this.o = true;
         this.O = 0;
      }

      if (this.s == 0) {
         this.I = 0;
         this.f[0] = 0;
         this.f[1] = 0;
         c.c = 4;
         this.V = 2;
         this.c(this.b[0].c, this.b[0].d);
         this.e(this.b[0].c, this.b[0].d);
         this.a((int)2, 3, (int)3);
         e.a(1, 1);
         this.p = false;
         this.c = false;
         this.aC = 0;
      } else if (this.s == 1) {
         this.I = 1;
         this.f[0] = 300;
         this.f[1] = 50;
         c.c = 4;
         this.V = 2;
         this.b[0].b(2);
         this.c(this.b[0].c, this.b[0].d);
         this.e(this.b[0].c, this.b[0].d);
         this.a((int)7, 12, (byte)0).a(7, 10, false);
         this.a((int)8, 11, (byte)0).a(8, 9, false);
         this.a((int)9, 12, (byte)0).a(9, 10, false);
         this.f(7, 3);
         a.a.a(this.G);
      } else if (this.s == 2) {
         this.I = 0;
         this.f[0] = 0;
         this.f[1] = 0;
         c.c = 4;
         this.f[0] = 0;
         this.c(this.b[0].c, this.b[0].d);
         this.e(this.b[0].c, this.b[0].d);
         this.m = this.a((int)8, 17, (byte)0);
         this.n = this.a((int)8, 18, (byte)0);
         this.o = this.a((int)8, 19, (byte)0);
         this.m.a(8, 15, false);
         this.n.a(8, 15, false);
         this.o.a(8, 15, false);
         this.b[0].a(8, 14, false);
         this.c = false;
         a.a.a(this.G);
         this.aC = 0;
      } else if (this.s == 3) {
         this.I = 7;
         c.c = 4;
         this.f[0] = 400;
         this.f[1] = 400;
         this.m = c.a((byte)0, (byte)0, -1, 5);
         this.n = c.a((byte)2, (byte)0, -2, 5);
         this.o = c.a((byte)3, (byte)0, -3, 5);
         this.m.a(3, 4, false);
         this.n.a(4, 4, false);
         this.o.a(2, 4, false);
         this.b[0].a(3, 3, false);
         this.c(this.b[0].c, this.b[0].d);
         this.e(3, 3);
         this.i = this.b[0];
         this.a((int)3, 3, (int)3);
         e.a(1, 1);
         this.p = false;
         this.c = false;
         this.aC = 0;
      } else if (this.s == 4) {
         this.I = 0;
         this.f[0] = 0;
         this.f[1] = 0;
         this.b(this.b[0].n + 12, this.b[0].o + 12);
         this.e(this.b[0].c, this.b[0].d);
         c.c = 4;
         c var6;
         (var6 = this.a((int)11, 2, (byte)0)).a(11, -3);
         var6.a(11, 2, false);
         (var6 = this.a((int)10, 1, (byte)0)).a(10, -5);
         var6.a(10, 1, false);
         (var6 = this.a((int)11, 1, (byte)0)).a(11, -5);
         var6.a(11, 1, false);
         (var6 = this.a((int)12, 1, (byte)0)).a(12, -5);
         var6.a(12, 1, false);
         (var6 = this.a((int)11, 0, (byte)0)).a(11, -7);
         var6.a(11, 0, false);
         (var6 = this.a((int)12, 0, (byte)0)).a(12, -7);
         var6.a(12, 0, false);
         a.a.a(this.G);
         this.c = false;
         this.aC = 0;
      } else if (this.s == 5) {
         this.I = 7;
         this.f[0] = 600;
         this.f[1] = 600;
         this.b[0].b(2);
         this.c(5, 0);
         this.e(5, 0);
         this.V = 4;
         this.f(this.b[0].c, this.b[0].d);
         a.a.a(this.G);
         this.c = false;
         this.aC = 0;
      } else if (this.s == 6) {
         this.I = 8;
         c.c = 4;
         this.f[0] = 400;
         this.f[1] = 600;
         c var5 = c.a((byte)0, (byte)0, 13, -1);
         c var12 = c.a((byte)1, (byte)0, 13, -1);
         c var3 = c.a((byte)3, (byte)0, 13, -1);
         c var4 = c.a((byte)11, (byte)0, 13, -1);
         this.b[0].a = var5;
         var5.a = var12;
         var12.a = var3;
         var3.a = var4;
         this.b[0].b(this.c);
         this.b[0].a(14, 3, true);
         this.c(this.b[0].c, this.b[0].d);
         this.e(this.b[0].c, this.b[0].d);
         this.i = this.b[0];
         a.a.a(this.G);
         this.c = false;
         this.aC = 0;
      } else {
         if (this.s == 7) {
            this.I = 8;
            c.c = 4;
            this.f[0] = 800;
            this.f[1] = 200;
            c var1;
            (var1 = this.a((int)7, 4, (byte)0)).b(3);
            this.b[1] = var1;
            c var2 = this.a((int)8, 15, (byte)0);
            this.b[0] = var2;
            var2.b(0);
            this.a((int)6, 15, (byte)0).b(2);
            this.b(this.b[0].n + 12, this.b[0].o + 12);
            this.e(this.b[0].c, this.b[0].d);
            this.a((int)4, 3, (int)3);
            e.a(1, 1);
            this.p = false;
            this.c = false;
            this.aC = 0;
         }
      }
   }

   public final void s() throws Exception {
      if (this.aB <= 0 || --this.aB <= 0) {
         if (this.z) {
            if (this.aC == 0) {
               this.f = true;
               this.B = 0;
               this.c = 11;
               this.aC = 1;
            }
         } else if (this.b == 1) {
            if (this.aC == 100) {
               e.a(c[this.j[this.f]], 0);
               this.e.a((byte)0, true);
               this.e.a((a)null);
               a.a.a(this.e);
               this.aC++;
            } else {
               if (this.aC == 101) {
                  byte var17 = -1;
                  int var28 = -1;
                  boolean var31 = true;

                  for (int var34 = 0; var34 < this.e; var34++) {
                     if (this.l[var34] != 2 && (this.b[var34] != null && this.b[var34].f != 3 || this.e(var34) != 0)) {
                        var28 = var34;
                        if (var17 != -1 && var17 != this.k[var34]) {
                           var31 = false;
                           break;
                        }

                        var17 = this.k[var34];
                     }
                  }

                  if (var31) {
                     this.l = false;
                     this.c = false;
                     String var35 = a.a(38, "" + (this.k[var28] + 1));
                     String var5 = a.a(81, var35) + "\n(";

                     for (int var37 = 0; var37 < this.e; var37++) {
                        if (this.l[var37] != 2 && this.k[var37] == this.k[var28]) {
                           var5 = var5 + " " + a.a(88 + this.j[var37]) + " ";
                        }
                     }

                     var5 = var5 + ")";
                     d var38;
                     (var38 = this.a(null, var5, this.b, this.d, -1)).a(this);
                     a.a.a(var38);
                     if (this.l[var28] == 1) {
                        e.a(6, 1);
                     } else {
                        e.a(7, 1);
                     }

                     this.c(15);
                     this.aC++;
                     return;
                  }
               } else if (this.aC == 102) {
                  this.f = true;
                  this.B = 0;
                  this.c = 11;
                  this.aC++;
               }
            }
         } else if (this.h == 1 && this.b == 0 && this.aC != -1) {
            if (this.aE != -1) {
               if (!this.b(this.aE, this.aF)) {
                  return;
               }

               this.aE = -1;
               this.aF = -1;
            }

            if (this.c != 11) {
               boolean var1 = true;

               for (int var2 = 0; var2 < this.e[0]; var2++) {
                  if (this.a[0][var2].f != 3) {
                     var1 = false;
                     break;
                  }
               }

               if (var1 && this.e(0) == 0) {
                  this.v();
                  return;
               }
            }

            if (this.s == 0) {
               switch (this.aC) {
                  case 0:
                     this.aC++;
                     break;
                  case 1:
                     a.a.a(this.G);
                     this.c(10);
                     this.aC++;
                     break;
                  case 2:
                     this.p = true;
                     this.a((int)0, 8, (byte)0).a(3, 8, false);
                     this.a((int)1, 9, (byte)0).a(4, 9, false);
                     this.a((int)0, 10, (byte)0).a(3, 10, false);
                     this.f(5, 9);
                     break;
                  case 3:
                     this.f(9, 3);
                     this.c = true;
                     break;
                  case 4:
                     this.c(10);
                     this.V = 12;
                     c.c = c.b;
                     this.aC++;
                     break;
                  case 5:
                     this.a(a.a(221), (byte)2, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 6:
                     c var9 = this.a((int)9, 3, (byte)0);
                     e.c(100);
                     var9.a(400);
                     this.a(this.i, var9.n, var9.o, 0, 0, 2, 50);
                     this.c(10);
                     this.aC++;
                     break;
                  case 7:
                     this.a(a.a(222), (byte)2, (byte)4);
                     this.aC++;
                     break;
                  case 8:
                     c var18 = this.a((int)9, 3, (byte)0);
                     this.a(this.h, var18.n, var18.o, 0, 0, 1, 50);
                     this.a(this.g, var18.n, var18.o, 0, -3, 1, 100);
                     var18.a();
                     this.c(20);
                     this.aC++;
                     break;
                  case 9:
                     this.c = false;
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 10:
                     this.c(10);
                     this.aC++;
                     break;
                  case 11:
                     this.a(a.a(223), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 12:
                     this.a(a.a(224), (byte)5, (byte)4);
                     this.aC++;
                     break;
                  case 13:
                     this.t();
                     this.aC++;
                     break;
                  case 14:
                     if (this.N == 0) {
                        this.H = 0;
                        this.aC++;
                     }
                     break;
                  case 15:
                     if (this.f == 0 && this.c == 1 && this.ae == 0) {
                        this.H = 1;
                        this.aC++;
                     }
                     break;
                  case 16:
                     if (this.f == 0 && this.r != null) {
                        this.H = 2;
                        this.aC++;
                     }
                     break;
                  case 17:
                     if (this.f == 0 && this.r != null) {
                        this.H = 3;
                        this.aC++;
                     }
                     break;
                  case 18:
                     if (this.a((int)-1, 2, (byte)0) >= 3) {
                        this.H = 4;
                        this.aC++;
                     } else if (this.a >= 1) {
                        this.aC++;
                     }
                     break;
                  case 19:
                     if (this.a >= 2) {
                        this.H = 5;
                        this.aC++;
                     }
                     break;
                  case 20:
                     this.H = 6;
                     this.aC++;
                     break;
                  case 21:
                     if (this.c == 1 && this.f == 0) {
                        this.H = 7;
                        this.aC++;
                     }
                     break;
                  case 22:
                     if (this.a((int)-1, -1, (byte)1) == 0) {
                        this.l = false;
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 23:
                     this.f(1, 1);
                     break;
                  case 24:
                     c.a((byte)1, (byte)1, 1, 1).a(1, 2, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 25:
                     this.f(10, 10);
                     break;
                  case 26:
                     c.a((byte)0, (byte)1, 10, 10).a(10, 9, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 27:
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 28:
                     this.a(a.a(225), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 29:
                     this.a(a.a(226), (byte)0, (byte)4);
                     this.l = true;
                     this.aC++;
                     break;
                  case 30:
                     if (this.a((int)-1, -1, (byte)1) == 0 && this.c == 0) {
                        this.l = false;
                        this.c = false;
                        this.c(30);
                        this.aC++;
                     }
                     break;
                  case 31:
                     this.n = true;
                     this.O = 0;
                     this.c(20);
                     this.aC++;
                     break;
                  case 32:
                     this.a(a.a(227), (byte)2, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 33:
                     this.a(a.a(228), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 34:
                     this.a(a.a(229), (byte)2, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 35:
                     this.a(a.a(230), (byte)0, (byte)4);
                     this.c(15);
                     this.aC++;
                     break;
                  case 36:
                     this.u();
               }
            } else if (this.s == 1) {
               switch (this.aC) {
                  case 1:
                     this.c(10);
                     this.aC++;
                     break;
                  case 2:
                     this.V = 4;
                     this.f(12, 3);
                     break;
                  case 3:
                     this.a(a.a(231), (byte)1, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 4:
                     this.a(a.a(232), (byte)3, (byte)4);
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 5:
                     this.a(a.a(233), (byte)5, (byte)4);
                     this.f(7, 3);
                     break;
                  case 6:
                     c.c = 2;
                     this.m = c.a((byte)0, (byte)1, 7, 3);
                     this.n = c.a((byte)11, (byte)1, 7, 3);
                     this.o = c.a((byte)0, (byte)1, 7, 3);
                     this.m.a = this.n;
                     this.n.a = this.o;
                     this.m.a(6, -2, false);
                     this.c(30);
                     this.aC++;
                     break;
                  case 7:
                     if (this.o.c == 6 && this.o.d == 1) {
                        c.c = 4;
                        this.p = c.a((byte)0, (byte)0, 7, 3);
                        this.p.a(6, 2, false);
                        this.n.a = null;
                        this.a(a.a(234), (byte)2, (byte)4);
                        this.aC++;
                     }
                     break;
                  case 8:
                     if (this.p.f != 1) {
                        e.c(100);
                        this.p.a(400);
                        this.a(this.i, this.p.n, this.p.o, 0, 0, 2, 50);
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 9:
                     this.a(a.a(235), (byte)2, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 10:
                     this.a(this.g, this.p.n, this.p.o, 0, -3, 1, 100);
                     this.a(this.h, this.p.n, this.p.o, 0, 0, 1, 50);
                     this.p.a();
                     this.p = null;
                     this.c(15);
                     this.aC++;
                     break;
                  case 11:
                     c.c = c.b;
                     this.m.a();
                     this.n.a();
                     this.m = null;
                     this.n = null;
                     this.o = null;
                     this.V = 12;
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 12:
                     this.a(a.a(236), (byte)5, (byte)4);
                     this.aC++;
                     break;
                  case 13:
                     this.a(a.a(237), (byte)1, (byte)4);
                     this.aC++;
                     break;
                  case 14:
                     this.f(3, 5);
                     break;
                  case 15:
                     this.a(a.a(238), (byte)5, (byte)4);
                     this.aC++;
                     break;
                  case 16:
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 17:
                     this.H = 8;
                     this.aC++;
                     break;
                  case 18:
                     this.H = 9;
                     this.aC++;
                     break;
                  case 19:
                     this.t();
                     this.aC++;
                     break;
                  case 20:
                     if (this.c == 9 && this.f == 0) {
                        this.H = 10;
                        this.aC++;
                     }
                     break;
                  case 21:
                     this.H = 11;
                     this.aC++;
                     break;
                  case 22:
                     if (this.b[0].f == 3 || this.b[1].f == 3) {
                        this.H = 12;
                        this.aC++;
                     }
                     break;
                  case 23:
                     if (this.a((int)-1, -1, (byte)1) == 0 && this.e(1) == 0) {
                        this.l = false;
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 24:
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 25:
                     this.a(a.a(239), (byte)1, (byte)4);
                     this.aC++;
                     break;
                  case 26:
                     this.a(a.a(240), (byte)5, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 27:
                     this.u();
               }
            } else if (this.s == 2) {
               label598:
               switch (this.aC) {
                  case 0:
                     if (this.m.f != 1) {
                        this.m.a(7, 14, false);
                        this.aC++;
                     }
                     break;
                  case 1:
                     if (this.n.f != 1) {
                        this.n.a(7, 15, false);
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 2:
                     c.c = c.b;
                     this.m = null;
                     this.n = null;
                     this.o = null;
                     this.a(a.a(241), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 3:
                     this.a(a.a(242), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 4:
                     this.a(a.a(243), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 5:
                     this.H = 14;
                     this.aC++;
                     break;
                  case 6:
                     this.t();
                     this.aC++;
                     break;
                  case 7:
                  case 8:
                     if (this.aC == 7 && this.f == 0 && this.N == 0 && this.a((int)-1, 3, (byte)-1) >= 1) {
                        this.H = 15;
                        this.aC++;
                     }

                     c[] var10 = this.a((int)-1, 2, (byte)0);

                     for (int var21 = 0; var21 < var10.length; var21++) {
                        if (var10[var21].c <= 4 || var10[var21].d <= 10) {
                           this.c(10);
                           this.l = false;
                           this.c = false;
                           this.aC = 9;
                           break label598;
                        }
                     }
                     break;
                  case 9:
                     this.f(0, 8);
                     c.a((byte)5, (byte)1, -1, 8).a(0, 8, false);
                     c.a((byte)5, (byte)1, -2, 7).a(1, 7, false);
                     this.c(20);
                     break;
                  case 10:
                     this.f(8, 6);
                     c.a((byte)5, (byte)1, 12, 6).a(8, 6, false);
                     this.c(20);
                     break;
                  case 11:
                     this.f(2, 1);
                     c.a((byte)5, (byte)1, 1, -2).a(1, 2, false);
                     c.a((byte)5, (byte)1, 3, -2).a(3, 2, false);
                     c.a((byte)4, (byte)1, 2, -1).a(2, 1, false);
                     this.c(20);
                     break;
                  case 12:
                     this.a(a.a(244), (byte)5, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 13:
                     this.f(4, 8);
                     this.c(15);
                     break;
                  case 14:
                     c var20 = c.a((byte)2, (byte)1, 3, 8);
                     c var29 = c.a((byte)2, (byte)1, 4, 7);
                     c var32 = c.a((byte)2, (byte)1, 5, 8);
                     this.a(this.h, var20.n, var20.o, 0, 0, 1, 50);
                     this.a(this.h, var29.n, var29.o, 0, 0, 1, 50);
                     this.a(this.h, var32.n, var32.o, 0, 0, 1, 50);
                     this.c(10);
                     this.aC++;
                     break;
                  case 15:
                     this.a(a.a(245), (byte)5, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 16:
                     this.a(a.a(246), (byte)-1, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 17:
                     this.a(a.a(247), (byte)0, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 18:
                     a.a.a(this.a(null, a.a(248), this.b, 1500));
                     this.aC++;
                     break;
                  case 19:
                     this.a((int)3, 8, (byte)0).a();
                     this.a((int)4, 7, (byte)0).a();
                     this.a((int)5, 8, (byte)0).a();
                     c var19 = c.a((byte)2, (byte)0, 3, 8);
                     c var3 = c.a((byte)2, (byte)0, 4, 7);
                     c var4 = c.a((byte)2, (byte)0, 5, 8);
                     this.a(this.h, var19.n, var19.o, 0, 0, 1, 50);
                     this.a(this.h, var3.n, var3.o, 0, 0, 1, 50);
                     this.a(this.h, var4.n, var4.o, 0, 0, 1, 50);
                     this.c(10);
                     this.aC++;
                     break;
                  case 20:
                     this.l = true;
                     this.c = true;
                     this.H = 13;
                     this.aC++;
                     break;
                  case 21:
                     if (this.a((int)-1, -1, (byte)1) == 0) {
                        this.l = false;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 22:
                     this.u();
               }
            } else if (this.s == 3) {
               switch (this.aC) {
                  case 0:
                     a.a.a(this.G);
                     this.p = true;
                     this.aC++;
                     break;
                  case 1:
                     if (this.b[0].f != 1) {
                        this.i = null;
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 2:
                     this.n = true;
                     this.p = true;
                     this.O = 0;
                     this.c(20);
                     this.aC++;
                     break;
                  case 3:
                     this.a(a.a(249), (byte)2, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 4:
                     this.a(a.a(250), (byte)0, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 5:
                     this.a(a.a(251), (byte)5, (byte)4);
                     this.e(13, 3);
                     this.b(312, 72);
                     this.b[0].a(7, 1);
                     this.m.a(5, 4);
                     this.n.a(7, 5);
                     this.o.a(3, 3);
                     this.m = null;
                     this.n = null;
                     this.o = null;
                     this.V = 2;
                     this.c(5);
                     this.aC++;
                     break;
                  case 6:
                     this.n = false;
                     this.o = true;
                     this.O = 0;
                     this.c(5);
                     this.aC++;
                     break;
                  case 7:
                     this.f(13, 10);
                     break;
                  case 8:
                     c.c = 2;
                     this.V = 4;
                     this.m = this.a((int)10, 10, (byte)0);
                     this.m.a(6, 10, false);
                     this.e(6, 10);
                     this.f(6, 10);
                     break;
                  case 9:
                     if (this.m.f != 1) {
                        this.m = null;
                        this.c = true;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 10:
                     this.e(4, 9);
                     this.f(4, 9);
                     this.a(this.i, 96, 216, 0, 0, 1, 50);
                     this.c(15);
                     break;
                  case 11:
                     this.c = c.a((byte)0, (byte)0, 4, 9, false);
                     this.c.d = -1;
                     this.c.f = 4;
                     this.z = 6;
                     this.c(20);
                     this.aC++;
                     break;
                  case 12:
                     this.a(a.a(252), (byte)5, (byte)4);
                     this.f(7, 1);
                     break;
                  case 13:
                     this.a(a.a(253), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 14:
                     this.H = 17;
                     this.aC++;
                     break;
                  case 15:
                     this.t();
                     this.aC++;
                     break;
                  case 16:
                     if (this.a((int)-1, -1, (byte)1) == 0 && this.e(1) == 0) {
                        this.c(15);
                        this.l = false;
                        this.aC++;
                     }
                     break;
                  case 17:
                     this.a(a.a(254), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 18:
                     this.a(a.a(255), (byte)0, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 19:
                     this.u();
               }
            } else if (this.s == 4) {
               if (this.q == null) {
                  this.q = this.a((int)11, -1, (byte)0)[0];
               }

               if (this.aC == 25 && this.q.c >= 15 && this.q.d >= 11 && this.q.f == 2) {
                  this.c(10);
                  this.l = false;
                  this.c = false;
                  this.aC = 26;
                  return;
               }

               if (this.q.f == 3) {
                  this.q = null;
                  this.v();
                  return;
               }

               label579:
               switch (this.aC) {
                  case 0:
                     this.c(50);
                     this.aC++;
                     break;
                  case 1:
                     this.a(a.a(256), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 2:
                     this.a(a.a(257), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 3:
                     this.t();
                     this.aC++;
                     break;
                  case 4:
                     c[] var14 = this.a((int)-1, -1, (byte)0);

                     for (int var25 = 0; var25 < var14.length; var25++) {
                        if (var14[var25].f == 2 && var14[var25].c <= 8) {
                           this.l = false;
                           this.c(5);
                           this.aC++;
                           break label579;
                        }
                     }
                     break;
                  case 5:
                     this.c = false;
                     this.f(4, 4);
                     break;
                  case 6:
                     c.a((byte)10, (byte)1, 4, 4).a(4, 1, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 7:
                     c.a((byte)1, (byte)1, 4, 4).a(5, 2, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 8:
                     c.a((byte)10, (byte)1, 4, 4).a(4, 3, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 9:
                     this.a(a.a(258), (byte)5, (byte)4);
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 10:
                     this.l = true;
                     this.c = true;
                     this.aC++;
                     break;
                  case 11:
                     c[] var13 = this.a((int)-1, -1, (byte)0);

                     for (int var24 = 0; var24 < var13.length; var24++) {
                        if (var13[var24].f == 2 && var13[var24].d >= 7) {
                           this.l = false;
                           this.c = false;
                           this.f(6, 10);
                           break label579;
                        }
                     }
                     break;
                  case 12:
                     c.a((byte)1, (byte)1, 6, 10).a(5, 10, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 13:
                     c.a((byte)5, (byte)1, 6, 10).a(7, 8, false, true);
                     this.c(15);
                     this.aC++;
                     break;
                  case 14:
                     c.a((byte)5, (byte)1, 6, 10).a(7, 9, false, true);
                     this.l = true;
                     this.c = true;
                     this.aC++;
                     break;
                  case 15:
                     c[] var12 = this.a((int)-1, -1, (byte)0);

                     for (int var23 = 0; var23 < var12.length; var23++) {
                        if (var12[var23].f == 2 && var12[var23].c >= 8 && var12[var23].d >= 6) {
                           this.l = false;
                           this.c = false;
                           this.f(12, 5);
                           break label579;
                        }
                     }
                     break;
                  case 16:
                     c.a((byte)5, (byte)1, 12, 5).a(12, 7, false, true);
                     this.c(15);
                     this.aC++;
                     break;
                  case 17:
                     c.a((byte)6, (byte)1, 12, 5).a(12, 6, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 18:
                     c.a((byte)5, (byte)1, 12, 5).a(12, 5, false, true);
                     this.l = true;
                     this.c = true;
                     this.aC++;
                     break;
                  case 19:
                     c[] var11 = this.a((int)-1, -1, (byte)0);

                     for (int var22 = 0; var22 < var11.length; var22++) {
                        if (var11[var22].f == 2 && var11[var22].c >= 15 && var11[var22].d >= 8) {
                           this.l = false;
                           this.c = false;
                           this.f(18, 8);
                           break label579;
                        }
                     }
                     break;
                  case 20:
                     c.a((byte)5, (byte)1, 18, 8).a(16, 10, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 21:
                     c.a((byte)6, (byte)1, 18, 8).a(17, 10, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 22:
                     c.a((byte)5, (byte)1, 18, 8).a(18, 10, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 23:
                     c.a((byte)1, (byte)1, 18, 8).a(18, 9, false, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 24:
                     this.a(a.a(259), (byte)0, (byte)4);
                     this.l = true;
                     this.c = true;
                     this.aC++;
                     break;
                  case 25:
                     if (this.a((int)-1, -1, (byte)1) == 0) {
                        this.l = false;
                        this.c = false;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 26:
                     this.u();
                     this.aC++;
               }
            } else if (this.s == 5) {
               switch (this.aC) {
                  case 0:
                     this.c(10);
                     this.aC++;
                     break;
                  case 1:
                     this.a(a.a(260), (byte)1, (byte)4);
                     this.aC++;
                     break;
                  case 2:
                     this.t();
                     this.aC++;
                     break;
                  case 3:
                     if (this.a((int)-1, -1, (byte)1) == 0 && this.e(1) == 0) {
                        this.l = false;
                        this.c = false;
                        this.c(15);
                        this.aC++;
                     }
                     break;
                  case 4:
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 5:
                     this.a(a.a(261), (byte)0, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 6:
                     this.u();
               }
            } else if (this.s == 6) {
               if (this.aC <= 10) {
                  if (this.q == null) {
                     this.q = this.a((int)11, -1, (byte)0)[0];
                  }

                  if (this.q.f == 3) {
                     this.q = null;
                     this.v();
                     return;
                  }
               }

               switch (this.aC) {
                  case 0:
                     if (this.b[0].f != 1) {
                        this.i = null;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 1:
                     this.a(a.a(262), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 2:
                     this.a(a.a(263), (byte)0, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 3:
                     c[] var15 = this.a((int)-1, -1, (byte)0);

                     for (int var27 = 0; var27 < var15.length; var27++) {
                        var15[var27].a = null;
                     }

                     this.t();
                     this.aC++;
                     break;
                  case 4:
                     if (this.a >= 2) {
                        this.c(15);
                        this.l = false;
                        this.c = false;
                        this.f(11, 7);
                     }
                     break;
                  case 5:
                     c var26;
                     (var26 = c.a((byte)5, (byte)1, 11, 8)).b(this.c);
                     var26.a(14, 7, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 6:
                     c var30;
                     (var30 = c.a((byte)0, (byte)1, 11, 8)).b(this.c);
                     var30.a(13, 7, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 7:
                     c var33;
                     (var33 = c.a((byte)3, (byte)1, 11, 8)).b(this.c);
                     var33.a(12, 7, true);
                     this.c(10);
                     this.aC++;
                     break;
                  case 8:
                     c.a((byte)1, (byte)1, 11, 8).a(13, 8, false);
                     this.c(20);
                     this.aC++;
                     break;
                  case 9:
                     this.a(a.a(264), (byte)5, (byte)4);
                     this.l = true;
                     this.c = true;
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 10:
                     boolean var6 = false;
                     c[] var7 = this.a((int)-1, 2, (byte)0);

                     for (int var39 = 0; var39 < var7.length; var39++) {
                        if (var7[var39].c <= 9 || var7[var39].d >= 10) {
                           var6 = true;
                           break;
                        }
                     }

                     if (var6 || this.a((int)-1, -1, (byte)1) == 0) {
                        this.c = false;
                        this.l = false;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 11:
                     this.m = this.a((int)11, -1, (byte)0)[0];
                     this.n = c.a((byte)8, (byte)1, this.o, this.m.d);
                     this.f(this.o - 1, this.m.d);
                     this.c = false;
                     break;
                  case 12:
                     this.n.a(this.m.c, this.m.d, false);
                     this.c(5);
                     this.aC++;
                     break;
                  case 13:
                     this.a(a.a(265), (byte)5, (byte)4);
                     this.i = this.n;
                     this.aC++;
                     break;
                  case 14:
                     if (this.n.f != 1) {
                        this.a(a.a(266), (byte)0, (byte)4);
                        this.n.a(-1, this.n.d, false);
                        this.c(3);
                        this.aC++;
                     }
                     break;
                  case 15:
                     this.m.a(-1, this.n.d, false);
                     this.aC++;
                     break;
                  case 16:
                     if (this.n.f != 1) {
                        this.c(10);
                        this.m.a();
                        this.n.a();
                        this.e(0, this.n.d);
                        this.m = null;
                        this.n = null;
                        this.i = null;
                        this.aC++;
                     }
                     break;
                  case 17:
                     this.f(1, 9);
                     break;
                  case 18:
                     this.b[1] = c.a((byte)9, (byte)1, -2, 8);
                     this.b[1].a(0, 8, false);
                     c.a((byte)0, (byte)1, -1, 8).a(3, 8, false);
                     c.a((byte)0, (byte)1, -1, 10).a(1, 10, false);
                     c.a((byte)8, (byte)1, -3, 7).a(4, 8, false);
                     c.a((byte)8, (byte)1, -3, 11).a(2, 10, false);
                     c.a((byte)4, (byte)1, -2, 9).a(2, 9, false);
                     c.a((byte)6, (byte)1, -4, 9).a(4, 9, false);
                     c.a((byte)6, (byte)1, -6, 9).a(5, 10, false);
                     this.c(50);
                     this.aC++;
                     break;
                  case 19:
                     this.a(a.a(267), (byte)3, (byte)4);
                     this.aC++;
                     break;
                  case 20:
                     this.f(13, 14);
                     break;
                  case 21:
                     c.a((byte)0, (byte)1, 13, 14).a(12, 14, false);
                     this.c(5);
                     this.aC++;
                     break;
                  case 22:
                     c.a((byte)6, (byte)1, 13, 14).a(14, 14, false);
                     this.c(5);
                     this.aC++;
                     break;
                  case 23:
                     c.a((byte)2, (byte)1, 13, 14).a(13, 12, false);
                     this.c(5);
                     this.aC++;
                     break;
                  case 24:
                     c.a((byte)3, (byte)1, 13, 14).a(13, 15, false);
                     this.c(15);
                     this.aC++;
                     break;
                  case 25:
                     this.a(a.a(268), (byte)5, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 26:
                     this.a(a.a(269), (byte)0, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 27:
                     this.f(13, 17);
                     break;
                  case 28:
                     c var8;
                     (var8 = c.a((byte)9, (byte)0, 13, 18)).b(2);
                     var8.a(13, 16, false);
                     c.a((byte)6, (byte)0, 12, 18).a(12, 16, false);
                     c.a((byte)8, (byte)0, 14, 19).a(14, 16, false);
                     c.a((byte)4, (byte)0, 13, 19).a(13, 17, false);
                     c.a((byte)1, (byte)0, 12, 19).a(12, 17, false);
                     this.c(20);
                     this.aC++;
                     break;
                  case 29:
                     this.a(a.a(270), (byte)1, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 30:
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 31:
                     this.H = 18;
                     this.aC++;
                     break;
                  case 32:
                     this.l = true;
                     this.c = true;
                     this.e = this.a(a.a(121 + this.s), a.a(138), this.b, -1);
                     this.e.a((byte)0, true);
                     this.e.a((a)null);
                     a.a.a(this.e);
                     this.aC++;
                     break;
                  case 33:
                     if (this.a((int)-1, -1, (byte)1) == 0 && this.e(1) == 0) {
                        this.l = false;
                        this.c = false;
                        this.c(10);
                        this.aC++;
                     }
                     break;
                  case 34:
                     this.u();
               }
            } else if (this.s == 7) {
               switch (this.aC) {
                  case 0:
                     a.a.a(this.G);
                     this.p = true;
                     this.aC++;
                     break;
                  case 1:
                     if (!this.o) {
                        this.a(a.a(271), (byte)0, (byte)4);
                        this.aC++;
                     }
                     break;
                  case 2:
                     this.f(this.b[1].c, this.b[1].d);
                     break;
                  case 3:
                     this.a(a.a(272), (byte)4, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 4:
                     this.a(a.a(273), (byte)1, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 5:
                     this.a(a.a(274), (byte)4, (byte)4);
                     this.aC++;
                     break;
                  case 6:
                     this.m = this.a((int)5, 2, (byte)0);
                     this.m.a(7, 2, false);
                     this.aC++;
                     break;
                  case 7:
                     if (this.m.f != 1) {
                        this.m.a();
                        this.m = null;
                        this.n = this.a((int)7, 3, (byte)0);
                        this.n.a(7, 2, false);
                        this.aC++;
                     }
                     break;
                  case 8:
                     if (this.n.f != 1) {
                        this.n.a();
                        this.n = null;
                        this.o = this.a((int)9, 2, (byte)0);
                        this.o.a(7, 2, false);
                        this.aC++;
                     }
                     break;
                  case 9:
                     if (this.o.f != 1) {
                        this.o.a();
                        this.o = null;
                        this.b[1].a(7, 2, false);
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 10:
                     this.f(9, 15);
                     this.c = true;
                     break;
                  case 11:
                     d var16;
                     (var16 = this.a(null, a.a(279), this.b, 2000)).a(this.c, 2, 17);
                     a.a.a(var16);
                     this.aC++;
                     break;
                  case 12:
                     this.q = false;
                     this.a(this.a((int)9, 15, (byte)0));
                     this.aC++;
                     break;
                  case 13:
                     if (this.Q >= 2) {
                        this.a(a.a(275), (byte)0, (byte)4);
                        this.a((int)9, 15, (byte)0).a();
                        this.q = true;
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 14:
                     this.c = false;
                     this.a(a.a(276), (byte)4, (byte)4);
                     this.aC++;
                     break;
                  case 15:
                     this.a(a.a(277), (byte)1, (byte)4);
                     this.c(10);
                     this.aC++;
                     break;
                  case 16:
                     this.c = true;
                     this.V = 4;
                     this.f(3, 9);
                     break;
                  case 17:
                     this.f(13, 4);
                     break;
                  case 18:
                     this.V = 12;
                     this.a(a.a(278), (byte)5, (byte)4);
                     this.f(this.b[0].c, this.b[0].d);
                     break;
                  case 19:
                     this.t();
                     this.aC++;
                     break;
                  case 20:
                     if (this.r) {
                        this.c = false;
                        this.l = false;
                        this.c(20);
                        this.aC++;
                     }
                     break;
                  case 21:
                     this.n = true;
                     this.O = 0;
                     this.p = true;
                     this.aC++;
                     break;
                  case 22:
                     if (this.O >= 16) {
                        this.c(7, 2);
                        this.e(7, 2);
                        this.i();
                        this.b[1] = c.a((byte)9, (byte)1, 7, 2);
                        this.b[1].b(3);
                        c.a((byte)9, (byte)0, 6, 3);
                        c.a((byte)9, (byte)0, 8, 3).b(2);
                        c.a((byte)0, (byte)0, 6, 1);
                        c.a((byte)0, (byte)0, 8, 1);
                        this.c(10);
                        this.aC++;
                        e.a(8, 0);
                     }
                     break;
                  case 23:
                     this.n = false;
                     this.o = true;
                     this.O = 0;
                     this.aC++;
                     break;
                  case 24:
                     if (this.O >= 16) {
                        this.a(a.a(281), (byte)4, (byte)4);
                        this.c(15);
                        this.aC++;
                     }
                     break;
                  case 25:
                     this.a(a.a(282), (byte)0, (byte)4);
                     this.c(8);
                     this.aC++;
                     break;
                  case 26:
                     this.a(a.a(283), (byte)4, (byte)4);
                     this.c(15);
                     this.aC++;
                     break;
                  case 27:
                     this.a(this.h, 168, 48, 0, 0, 1, 50);
                     this.a.removeElement(this.b[1]);
                     this.c(15);
                     this.aC++;
                     break;
                  case 28:
                     e.c(400);
                     this.d(5000);
                     this.c(10);
                     this.aC++;
                     break;
                  case 29:
                     this.a(a.a(284), (byte)5, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 30:
                     this.a(a.a(285), (byte)2, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 31:
                     this.a(a.a(286), (byte)1, (byte)4);
                     this.c(5);
                     this.aC++;
                     break;
                  case 32:
                     this.a(a.a(287), (byte)0, (byte)4);
                     this.n = true;
                     this.O = 0;
                     this.aC++;
                     break;
                  case 33:
                     if (this.O >= 16) {
                        this.c(10);
                        this.B = false;
                        this.aC++;
                     }
                     break;
                  case 34:
                     this.a((int)5, 2, (int)2);
                     this.aC++;
                     break;
                  case 35:
                     e.a(0, 0);
                     this.a(a.a(288));
                     this.aC++;
                     break;
                  case 36:
                     this.aG = 0;
                     this.c = 14;
                     this.aC++;
               }
            }

            this.r = null;
         }
      }
   }

   public final void t() {
      this.G = null;
      this.V = 12;
      c.c = c.b;
      this.e.a((byte)0, true);
      this.e.a((byte)1, false);
      a.a.a(this.e);
      this.c = true;
      this.l = true;
      this.m = false;
      e.a(2, 0);
   }

   public final void f(int var1, int var2) {
      this.aE = var1;
      this.aF = var2;
      this.e(var1, var2);
      this.aC++;
   }

   public final void u() {
      e.f();
      e.b(6, 1);
      a.a.a(this.a(null, a.a(72), this.b, 3000));
      this.d = this.c;
      this.aC = -1;
      this.aG = 0;
      this.c = 10;
   }

   public final void v() {
      this.z = true;
      this.aC = 0;
      this.c(20);
      e.f();
      e.b(7, 1);
   }

   public final void b(c var1, c var2) throws Exception {
      System.gc();
      this.aH = this.b - this.ao;
      this.D = true;
      this.B = 0;
      this.A = false;
      this.e = var1;
      this.f = var2;
      e.b("/2.pak");
      this.a = new g(this, var1, null);
      this.b = new g(this, var2, this.a);
      this.a.a = this.b;
      var1.c(var2);
      if (var2.a(var1, var1.c, var1.d)) {
         var2.c(var1);
         this.C = true;
      } else {
         this.C = false;
      }

      this.a.c = (byte)var1.g;
      this.a.e = (byte)var1.c();
      this.b.c = (byte)var2.g;
      this.b.e = (byte)var2.c();
      e.b(d[this.j[this.f]], 0);
      this.h = 2;
   }

   public final void a(f var1) {
      this.g.addElement(var1);
   }

   public final void b(f var1) {
      this.g.removeElement(var1);
   }

   public final void w() throws Exception {
      if (this.B && this.c - this.n >= this.m) {
         this.B = false;
      }

      for (int var1 = 0; var1 < this.g.size(); var1++) {
         ((f)this.g.elementAt(var1)).c();
      }

      for (int var3 = 0; var3 < this.g.size(); var3++) {
         f var2;
         if (!(var2 = (f)this.g.elementAt(var3)).d) {
            this.b(var2);
         }
      }

      this.a.e();
      this.b.e();
      if (this.D) {
         this.B++;
         if (this.B >= 16) {
            this.D = false;
            this.a.a();
         }

         this.E = true;
         this.F = true;
      } else {
         if (this.A) {
            if (this.c - this.l >= 300L) {
               this.g.removeAllElements();
               this.b = null;
               this.a = null;
               this.c = new Vector();
               this.h();
               this.h = 1;
               e.f();
               e.b(c[this.j[this.f]], 0);
               a.a.b();
               this.t = true;
               this.u = true;
               return;
            }
         } else if (this.a.b) {
            if (this.C && this.b.c > 0) {
               if (!this.b.a) {
                  this.b.a();
               }

               if (this.b.b) {
                  this.A = true;
                  this.l = this.c;
                  return;
               }
            } else {
               this.A = true;
               this.l = this.c;
            }
         }
      }
   }

   public final void f(Graphics var1) {
      int var2 = 0;
      int var3 = 0;
      if (this.B) {
         var2 = e.a() % 10;
         var3 = e.a() % 3;
      }

      var1.translate(0, this.ao);
      var1.setClip(0, 0, this.a, this.aH);
      this.a.a(var1, var2, var3);
      this.b.a(var1, var2 + this.c, var3);
      var1.setColor(0);
      var1.fillRect(this.c - 1 + var2, 0, 2, this.aH);
      this.a.b(var1);
      this.b.b(var1);
      Vector var4 = new Vector(this.g.size());

      for (int var5 = 0; var5 < this.g.size(); var5++) {
         f var6 = (f)this.g.elementAt(var5);
         int var7 = 0;
         if (var6.f) {
            var4.addElement(var6);
         } else {
            for (var7 = 0; var7 < var4.size(); var7++) {
               f var8;
               if ((var8 = (f)var4.elementAt(var7)).f || var6.o + var6.q < var8.o + var8.q) {
                  var4.insertElementAt(var6, var7);
                  break;
               }
            }
         }

         if (var7 == var4.size()) {
            var4.addElement(var6);
         }
      }

      this.g = var4;

      for (int var9 = 0; var9 < this.g.size(); var9++) {
         f var11;
         if ((var11 = (f)this.g.elementAt(var9)).l == 0) {
            var1.setClip(0, 0, this.c, this.aH);
         } else if (var11.l == 1) {
            var1.setClip(this.c, 0, this.c, this.aH);
         } else {
            var1.setClip(0, 0, this.a, this.aH);
         }

         var11.a(var1, 0, var11.r);
      }

      var1.translate(0, -this.ao);
      var1.setClip(0, 0, super.W, super.X);
      if (this.F) {
         this.F = false;
         int var10 = super.X - a;
         var1.setColor(14672074);
         var1.fillRect(0, var10, super.W, a);
         d.a(var1, 0, var10, super.W, a, 0);
         var1.setClip(0, 0, super.W, super.X);
         this.a.a(var1);
         var1.translate(this.c, 0);
         this.b.a(var1);
         var1.translate(-this.c, 0);
      }

      if (this.E) {
         this.E = false;
         this.a(var1, this.a.a, this.b.a, 0);
      }

      if (this.D) {
         a(var1, 0, this.B, 16, 1, null, 0, 0, super.W, super.X);
      }
   }

   public final void d(int var1) {
      this.B = true;
      this.m = var1;
      this.n = this.c;
   }

   public final d a(String[] var1, a var2) {
      d var3;
      if (this.n.length > 0) {
         d var4;
         (var4 = (var3 = new d((byte)11, 0)).a(a.a(46))).a = this.b[6];
         var3.a(this.n, this.a / 2, (this.b + var4.g) / 2, this.a, this.b - var4.g, 3, 4);
      } else {
         (var3 = new d((byte)10, 0)).a(a.a(46)).a = this.b[6];
         var3.a(null, a.a(52), this.a, -1);
      }

      var3.a(var2);
      a.a.a(var3);
      return var3;
   }

   public final void b(byte[] var1) {
      try {
         DataInputStream var2;
         (var2 = new DataInputStream(new ByteArrayInputStream(var1))).readLong();
         switch (var2.readInt()) {
            case 10001:
               var2.readUTF();
               var2.readInt();
               var2.readUTF();
               var2.readInt();
               var2.readUTF();
               var2.readInt();
               var2.readUTF();
               int var6 = var2.readInt();
               var2.readUTF();
               var2.readUTF();
               if (this.aL == 0) {
                  int var14 = var2.readInt() / 2;
                  this.n = new String[var14];
                  this.o = new String[var14];
                  this.p = new String[var14];
                  boolean var16 = false;

                  for (int var17 = 0; var17 < var14; var17++) {
                     this.n[var17] = var2.readUTF();
                     this.o[var17] = var2.readUTF();
                  }

                  this.A = this.a(this.n, this.a);
               } else if (this.aL == 1) {
                  var2.readInt();
                  this.p[this.aI] = var2.readUTF();
                  d var13;
                  (var13 = this.a(this.n[this.aI], this.p[this.aI], this.b, this.b / 2, -1)).a(this.a);
                  a.a.a(var13);
               } else if (this.aL != 2) {
                  if (this.aL == 3) {
                     String var12 = this.q[this.aJ];
                     byte[] var15 = new byte[var6];
                     var2.readFully(var15);
                     this.a(var12, var15);
                     this.a(this.D.a);
                     d var9;
                     (var9 = this.a(null, a.a(45, var12), this.b, 2000)).a(this.D);
                     a.a.a(var9);
                  }
               } else {
                  int var7 = var2.readInt() / 3;
                  this.q = new String[var7];
                  this.r = new String[var7];
                  this.k = new int[var7];

                  for (int var8 = 0; var8 < var7; var8++) {
                     this.q[var8] = var2.readUTF();
                     this.r[var8] = var2.readUTF();
                     this.k[var8] = Integer.parseInt(var2.readUTF());
                  }

                  this.a(this.a);
                  a.a.a(this.D);
               }

               this.a = null;
               return;
            default:
               var2.close();
         }
      } catch (Exception var10) {
         var10.printStackTrace();
      }

      d var11;
      (var11 = this.a(null, a.a(44), this.b, -1)).a(this.a);
      this.a = null;
      a.a.a(var11);
   }

   public final void a(int var1, String var2, String var3, a var4) throws Exception {
      this.aL = var1;
      this.a = var4;
      this.G = false;
      this.a = new ByteArrayOutputStream();
      this.a = new DataOutputStream(this.a);
      this.a.writeInt(10001);
      this.a.writeUTF(this.d);
      this.a.writeUTF(this.e);
      this.aK = this.a.size();
      this.a.writeUTF("resourceName");
      this.a.writeUTF(var2);
      this.a.writeUTF("languageCode");
      this.a.writeUTF(var3);
      this.a.writeUTF("maxChunkSize");
      this.a.writeUTF("1024");
      this.a.writeUTF("chunk");
      this.a.writeUTF("0");
      this.a.writeUTF("requestId");
      this.a.writeUTF("0");
      d var5;
      (var5 = this.a(null, a.a(43), this.b, -1)).a(var4);
      a.a.a(var5);
      new Thread(this).start();
   }

   public final void run() {
      byte[] var1 = null;
      HttpConnection var2 = null;

      try {
         byte[] var3 = this.a.toByteArray();
         this.a.close();
         this.a.close();
         var2 = (HttpConnection)Connector.open(this.f);
         if ("J4d28g1Kl490".length() > 0) {
            byte[] var4 = "J4d28g1Kl490".getBytes();

            for (int var5 = this.aK; var5 < var3.length; var5++) {
               var3[var5] ^= var4[var5 % var4.length];
            }
         }

         var2.setRequestMethod("POST");
         var2.setRequestProperty("Content-Length", Integer.toString(var3.length));
         var2.setRequestProperty("Connection", "close");
         OutputStream var20;
         (var20 = var2.openOutputStream()).write(var3);
         var20.flush();
         var20.close();
         DataInputStream var21 = var2.openDataInputStream();
         int var6;
         if ((var6 = var2.getResponseCode()) != 200) {
            throw new Exception("" + var6);
         }

         ByteArrayOutputStream var7 = new ByteArrayOutputStream();
         int var8 = 0;

         while ((var8 = var21.read()) != -1) {
            var7.write(var8);
         }

         var1 = var7.toByteArray();
         var7.close();
         var21.close();
      } catch (Exception var18) {
         var18.printStackTrace();
      } finally {
         if (var2 != null) {
            try {
               var2.close();
            } catch (Exception var17) {
               var17.printStackTrace();
            }
         }
      }

      if (!this.G) {
         this.b(var1);
      }
   }

   public final void e(int var1) throws Exception {
      int var2 = this.i[var1];
      this.R--;
      String[] var3 = new String[this.R];
      int[] var4 = new int[this.R];
      System.arraycopy(this.i, 0, var3, 0, var1);
      System.arraycopy(this.i, var1 + 1, var3, var1, this.R - var1);
      System.arraycopy(this.i, 0, var4, 0, var1);
      System.arraycopy(this.i, var1 + 1, var4, var1, this.R - var1);
      this.i = var3;
      this.i = var4;
      e.a("download", var2);
      this.T = e.a("download");
      this.x();

      for (int var5 = 0; var5 < 3; var5++) {
         if (this.h[var5] == var2 + a.length) {
            this.m[var5] = -1;
            this.h[var5] = -1;
            this.h[var5] = "\n" + a.a(79) + "\n ";
            e.a("save", var5, new byte[0]);
         }
      }
   }

   public final void a(String var1, byte[] var2) throws Exception {
      String[] var3 = new String[this.R + 1];
      int[] var4 = new int[this.R + 1];
      System.arraycopy(this.i, 0, var3, 0, this.R);
      System.arraycopy(this.i, 0, var4, 0, this.R);
      this.i = var3;
      this.i = var4;
      this.i[this.R] = e.a("download", var2);
      this.i[this.R] = var1;
      this.R++;
      this.T = e.a("download");
      this.x();
   }

   public final void x() throws Exception {
      ByteArrayOutputStream var1 = new ByteArrayOutputStream();
      DataOutputStream var2;
      (var2 = new DataOutputStream(var1)).writeInt(this.R);

      for (int var3 = 0; var3 < this.R; var3++) {
         var2.writeInt(this.i[var3]);
         var2.writeUTF(this.i[var3]);
      }

      e.a("settings", 2, var1.toByteArray());
      var2.close();
   }
}
