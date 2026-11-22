/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 */
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public final class a {
    private int[][] a;
    private Image b;
    private int c = 1;
    private int d = 1;
    private int e = 127;
    private String f = "";

    public a() {
        if (this.a == null) {
            this.b();
        }
        if (this.b == null) {
            try {
                this.b = b.a("/fnt.png");
                return;
            }
            catch (Exception exception) {}
        }
    }

    public final int a(char c2) {
        int n = this.c + this.a[2][this.a((int)c2)];
        if (c2 == '\n' || c2 == '\r') {
            n = 0;
        }
        return n;
    }

    private final void b() {
        byte[] byArray = b.d.a("cf" + this.f, -1);
        this.e = byArray.length / 6;
        this.a = new int[6][this.e + 2];
        int n = 0;
        int n2 = 0;
        while (n2 < this.e) {
            int n3 = 0;
            while (n3 < 6) {
                this.a[n3][n2] = byArray[n];
                ++n;
                ++n3;
            }
            ++n2;
        }
    }

    public final void a(Graphics graphics, String string, int n, int n2, int n3) {
        this.a(graphics, string, 0, string.length(), n, n2, 20);
    }

    public final void a(Graphics graphics, String string, int n, int n2, int n3, int n4, int n5) {
        n = n3;
        n3 = n4 + this.a() - this.d;
        int n6 = n2;
        int n7 = 0;
        int c2 = n5;
        String string2 = string;
        a a2 = this;
        int[] n12 = new int[2];
        int n8 = a2.a();
        int n9 = a2.a(string2, n7, n6);
        if ((c2 & 0x20) > 0) {
            n12[1] = n12[1] - n8;
        }
        if ((c2 & 2) > 0) {
            n12[1] = n12[1] - (n8 >> 1);
        }
        if ((c2 & 8) > 0) {
            n12[0] = n12[0] - n9;
        }
        if ((c2 & 1) > 0) {
            n12[0] = n12[0] - (n9 >> 1);
        }
        int[] nArray2 = n12;
        n += nArray2[0];
        n3 += nArray2[1];
        int n10 = 0;
        while (n10 < n2 + 0) {
            int n11 = n;
            n6 = n3;
            n7 = n;
            char c3 = string.charAt(n10);
            string2 = graphics;
            a2 = this;
            int n13 = string2.getClipX();
            n8 = string2.getClipY();
            n9 = string2.getClipWidth();
            n = string2.getClipHeight();
            int n14 = a2.a((int)c3);
            int n15 = a2.a[3][n14];
            string2.setClip(n7 + a2.a[4][n14], n6 - a2.a[5][n14] - n15, a2.a[2][n14], a2.a[3][n14]);
            string2.drawImage(a2.b, n7 - a2.a[0][n14] + a2.a[4][n14], n6 - a2.a[1][n14] - a2.a[5][n14] - n15, 20);
            string2.setClip(n13, n8, n9, n);
            n = n11 + a2.a(c3);
            ++n10;
        }
    }

    public final int a() {
        return this.d + this.a[3][this.a(1062)];
    }

    private int a(int n) {
        if (n >= 65408) {
            n -= 65280;
        }
        if (n > 848) {
            n -= 848;
        }
        if (n == 168) {
            n = 197;
        }
        if (n == 184) {
            n = 229;
        }
        if (n >= 97 && n <= 122) {
            n -= 32;
        } else if (n >= 192 && n <= 223) {
            n -= 96;
        } else if (n >= 224 && n <= 255) {
            n -= 128;
        } else if (n >= 154 && n <= 191) {
            n -= 26;
        }
        if ((n -= 32) < 0 || n >= this.e) {
            n = 0;
        }
        return n;
    }

    public final int a(String string) {
        int n = 0;
        int n2 = string.length();
        int n3 = 0;
        while (n3 < n2) {
            n += this.a(string.charAt(n3));
            ++n3;
        }
        return n;
    }

    public final int a(String string, int n, int n2) {
        int n3 = 0;
        int n4 = 0;
        while (n4 < n2) {
            n3 += this.a(string.charAt(n4 + n));
            ++n4;
        }
        return n3;
    }
}

