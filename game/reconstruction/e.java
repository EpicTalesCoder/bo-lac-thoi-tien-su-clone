import java.io.InputStream;
import java.io.IOException;
import java.io.DataInputStream;
import javax.microedition.lcdui.Image;

// 
// Decompiled by Procyon v0.6.0
// 

public final class e
{
    f a;
    short[] a;
    byte a;
    byte[] a;
    String[] a;
    
    public e(final f a) {
        this.a = new short[] { 119, 1291, 162, 162, 2782, 144, 1069, 6903, 823, 1721, 5492, 119, 1291, 1291, 1291, 162, 162, 162, 2782, 2782, 144, 1069, 1069, 6903, 6903, 6903, 823, 1721, 42, 5492, 5492, 1810, 1810, 1810, 1810, 1810 };
        this.a = new byte[] { 31, 6, 12 };
        this.a = new String[] { "/pi0", "/pi9", "/pi8" };
        this.a = a;
        this.a();
        this.c();
        this.i();
        this.a = 0;
        this.d();
        this.a = 1;
        this.d();
        this.b();
        this.f();
        this.e();
        this.g();
        this.h();
    }
    
    private void a() {
        System.gc();
        Thread.yield();
        int n = 0;
        this.a.b = new short[11][];
        this.a.j = new byte[25][];
        for (int i = 0; i <= 24; ++i) {
            this.a.j[i] = new byte[this.a[n + 10 + 1]];
            if (i <= 10) {
                this.a.b[i] = new short[this.a[n]];
            }
            ++n;
        }
        System.gc();
        Thread.yield();
        (this.a.a = new Image[3][])[2] = new Image[1];
    }
    
    private void b() {
        System.gc();
        Thread.yield();
        try {
            final DataInputStream dataInputStream;
            (dataInputStream = new DataInputStream(this.getClass().getResourceAsStream("/pd0"))).readByte();
            int n = 0;
            for (int i = 0; i <= 10; ++i) {
                for (short n2 = 0; n2 < this.a[n]; ++n2) {
                    this.a.b[i][n2] = dataInputStream.readShort();
                }
                ++n;
                this.a.a(1);
            }
            for (int j = 0; j <= 24; ++j) {
                for (short n3 = 0; n3 < this.a[n]; ++n3) {
                    this.a.j[j][n3] = dataInputStream.readByte();
                }
                ++n;
                this.a.a(1);
            }
            dataInputStream.close();
            f.aV = this.a.j[23][this.a.b[10][this.a.b[9][548] & 0x1FFF] & 0x1FFF] + 9;
            f.aU = (240 - this.a.j[1][1010] * 2) / f.aV;
        }
        catch (final Exception ex) {}
    }
    
    private void c() {
        try {
            System.gc();
            Thread.yield();
            this.a.A = 288;
            this.a.O = 11;
            this.a.P = (byte)((this.a.A - 1) / 16 + 1);
            this.a.y = (byte)(this.a.O >> 1);
            this.a.A = (byte)(this.a.P >> 1);
            this.a.C = this.a.y;
            this.a.D = this.a.A;
            this.a.a = new int[] { 264, 264, 240, 240, 240, 240, 68, 240, 68, 63, 240, 240, 240 };
            this.a.b = new int[] { 352, 304, 22, 48, 22, 48, 55, 86, 49, 55, 38, 0, 0 };
            this.a.c = new int[] { 0, 0, 304, 304, 326, 326, 0, 326, 0, 0, 326, 0, 0 };
            this.a.d = new int[] { 0, 16, 0, 0, 298, 272, 0, 234, 0, 0, 282, 320, 0 };
            this.a.c = new byte[] { 0, 1, 0, 0, 0, 0, 2, 0, 2, 2, 0, 0, 0 };
            this.a.d = new byte[] { 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
            f.a[this.a.c[1]] = Image.createImage(264, 304);
            f.a[this.a.c[1]] = f.a[this.a.c[1]].getGraphics();
            f.a[3] = Image.createImage(264, 304);
            f.a[3] = f.a[3].getGraphics();
            f.a[this.a.c[6]] = Image.createImage(79, 63);
            f.a[this.a.c[6]] = f.a[this.a.c[6]].getGraphics();
            this.a.bb = this.a.b[2];
        }
        catch (final Exception ex) {}
    }
    
    private void d() {
        System.gc();
        Thread.yield();
        final byte b = this.a[this.a];
        try {
            System.gc();
            Thread.yield();
            final DataInputStream dataInputStream = new DataInputStream(this.getClass().getResourceAsStream(this.a[this.a]));
            final byte[] b2 = new byte[62502];
            dataInputStream.read(b2);
            dataInputStream.close();
            int n = 0;
            for (byte b3 = 0; b3 < b; ++b3) {
                final byte b4 = (byte)(b2[n] & 0xFF);
                ++n;
                if (b3 == 0) {
                    this.a.a[this.a] = new Image[b];
                }
                if (b4 == 255) {
                    return;
                }
                final short n2 = (short)(b4 << 8 | (b2[n] & 0xFF));
                ++n;
                try {
                    if (b3 < 27) {
                        this.a.a[this.a][b3] = Image.createImage(b2, n, (int)n2);
                    }
                }
                catch (final Exception ex) {}
                n += n2;
                this.a.a(2);
                System.gc();
                Thread.yield();
            }
        }
        catch (final Exception ex2) {}
    }
    
    private void e() {
        System.gc();
        Thread.yield();
        this.a.a = new c(this.a);
        this.a.a.f = new byte[122];
        this.a.a.e = new byte[33];
        this.a.a.b = new byte[33][25];
        this.a.a.c = new byte[33][25];
        this.a.a.d = new byte[33];
        this.a.a.d = new short[33];
        this.a.a.e = new short[33];
        this.a.a.f = new short[33];
        this.a.a.g = new short[250];
        this.a.a.h = new short[250];
        this.a.a.b(0);
    }
    
    private void f() {
        System.gc();
        Thread.yield();
        this.a.a = new byte[17638];
        this.a.a = new short[312];
        this.a.b = new short[570];
        this.a.c = new short[5];
        try {
            final InputStream resourceAsStream;
            if ((resourceAsStream = this.getClass().getResourceAsStream("/a")) != null) {
                this.a.a[0] = (this.a.c[0] = 0);
                for (int i = 0; i < 312; ++i) {
                    final int len = ((resourceAsStream.read() & 0xFF) << 8) + (resourceAsStream.read() & 0xFF);
                    if (i < 311) {
                        this.a.a[i + 1] = (short)(this.a.a[i] + len);
                    }
                    if (len > 0) {
                        resourceAsStream.read(this.a.a, this.a.a[i], len);
                    }
                }
                for (int j = 0; j < 5; ++j) {
                    final int n = ((resourceAsStream.read() & 0xFF) << 8) + (resourceAsStream.read() & 0xFF);
                    if (j < 4) {
                        this.a.c[j + 1] = (short)(this.a.c[j] + n);
                    }
                    for (short n2 = 0; n2 < n; ++n2) {
                        this.a.b[this.a.c[j] + n2] = (short)(((resourceAsStream.read() & 0xFF) << 8) + (resourceAsStream.read() & 0xFF));
                    }
                }
            }
            resourceAsStream.close();
        }
        catch (final IOException ex) {}
    }
    
    private void g() {
        try {
            System.gc();
            Thread.yield();
            f.e = new short[] { 8014, 6315, 5648, 3405, 3234 };
            f.f = new short[] { 0, 8014, 14329, 19977, 23382 };
            f.w = new byte[26616];
            this.a.b = new byte[] { 0, 1, 2, 3, 4, 4 };
            final InputStream resourceAsStream;
            (resourceAsStream = this.getClass().getResourceAsStream("/sa")).read(f.w, 0, 26616);
            resourceAsStream.close();
        }
        catch (final Exception ex) {}
    }
    
    private void h() {
        try {
            System.gc();
            Thread.yield();
            this.a.h = new int[] { 0, 2545, 6965, 10649, 15487, 22633, 27261, 31708, 35466, 39214 };
            this.a.v = new byte[42381];
            final InputStream resourceAsStream;
            (resourceAsStream = this.getClass().getResourceAsStream("/ma")).read(this.a.v, 0, 42381);
            resourceAsStream.close();
        }
        catch (final Exception ex) {}
    }
    
    private void i() {
        System.gc();
        Thread.yield();
        this.a.e = new byte[9983];
        this.a.b = new byte[96][96];
        this.a.c = new byte[96][96];
        this.a.a = new int[3][4];
        try {
            this.a.a = this.a.a.getAppProperty("MIDlet-Version");
            this.a.d = this.a.a.getAppProperty("GameLinkEnabled").equals("true");
            this.a.a = this.a.a.getAppProperty("Cheat-Support").equals("on");
        }
        catch (final Exception ex) {}
        if (!this.a.d) {
            return;
        }
        final f a = this.a;
        this.a.getClass();
        a.U = 1;
    }
}
