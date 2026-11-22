/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Graphics
 *  javax.microedition.lcdui.Image
 */
package com.nokia.mid.ui;

import com.nokia.mid.ui.DirectGraphics;
import com.nokia.mid.ui.DirectGraphicsImplemented;
import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public abstract class DirectUtils {
    public static DirectGraphics getDirectGraphics(Graphics graphics) {
        return new DirectGraphicsImplemented(graphics);
    }

    public static Image createImage(byte[] byArray, int n, int n2) {
        Image image = Image.createImage((byte[])byArray, (int)n, (int)n2);
        return image;
    }

    public static Image createImage(int n, int n2, int n3) {
        Image image = Image.createImage((int)n, (int)n2);
        Graphics graphics = image.getGraphics();
        int n4 = graphics.getColor();
        graphics.setColor(0xFFFFFF & n3);
        graphics.fillRect(0, 0, n - 1, n2 - 1);
        graphics.setColor(n4);
        return image;
    }
}

