/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 */
package com.nokia.mid.ui;

import com.nokia.mid.ui.DirectGraphics;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public class DirectGraphicsImplemented
implements DirectGraphics {
    private Graphics my_g = null;

    protected DirectGraphicsImplemented(Graphics graphics) {
        this.my_g = graphics;
    }

    public void setARGBColor(int n) {
        this.my_g.setColor(n);
    }

    public void drawTriangle(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.my_g.setColor(n7);
        this.my_g.drawLine(n, n2, n3, n4);
        this.my_g.drawLine(n3, n4, n5, n6);
        this.my_g.drawLine(n5, n6, n, n2);
    }

    public void fillTriangle(int n, int n2, int n3, int n4, int n5, int n6, int n7) {
        this.drawTriangle(n, n2, n3, n4, n5, n6, n7);
    }

    public void drawPolygon(int[] nArray, int n, int[] nArray2, int n2, int n3, int n4) {
        this.my_g.setColor(n4);
        for (int i = 0; i < n3 - 1; ++i) {
            this.my_g.drawLine(nArray[n + i], nArray2[n2 + i], nArray[n + i + 1], nArray2[n2 + i + 1]);
        }
    }

    public void fillPolygon(int[] nArray, int n, int[] nArray2, int n2, int n3, int n4) {
        this.drawPolygon(nArray, n, nArray2, n2, n3, n4);
    }

    public int getNativePixelFormat() {
        return 888;
    }

    public int getAlphaComponent() {
        return 0;
    }

    public void drawImage(Image image, int n, int n2, int n3, int n4) {
        if (n4 == 0) {
            this.my_g.drawImage(image, n, n2, n3);
        } else {
            this.my_g.drawRegion(image, 0, 0, image.getWidth(), image.getHeight(), (n4 & 0x2000) > 0 ? 2 : 0, n, n2, n3);
        }
    }

    public void drawPixels(int[] nArray, boolean bl, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        for (int i = n3; i < n3 + n5; ++i) {
            for (int j = n4; j < n4 + n6; ++j) {
                this.my_g.setColor(nArray[n + (i - n3) + (j - n4) * n2]);
                this.my_g.drawLine(i, j, i, j);
            }
        }
    }

    public void drawPixels(short[] sArray, boolean bl, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        if (n8 == 4444) {
            for (int i = n3; i < n3 + n5; ++i) {
                for (int j = n4; j < n4 + n6; ++j) {
                    if ((sArray[n + (i - n3) + (j - n4) * n2] & 0xF000) == 0) continue;
                    int n9 = 0xF0 & sArray[n + (i - n3) + (j - n4) * n2] << 4;
                    n9 |= 0xF000 & sArray[n + (i - n3) + (j - n4) * n2] << 8;
                    this.my_g.setColor(n9 |= 0xF00000 & sArray[n + (i - n3) + (j - n4) * n2] << 12);
                    this.my_g.drawLine(i, j, i, j);
                }
            }
        }
    }

    public void drawPixels(byte[] byArray, byte[] byArray2, int n, int n2, int n3, int n4, int n5, int n6, int n7, int n8) {
        this.my_g.drawLine(n3, n4, n5, n6);
    }

    public void getPixels(int[] nArray, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
    }

    public void getPixels(byte[] byArray, byte[] byArray2, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
    }

    public void getPixels(short[] sArray, int n, int n2, int n3, int n4, int n5, int n6, int n7) {
    }
}

