/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.game.GameCanvas
 */
package com.hellomoto.fullscreen;

import javax.microedition.lcdui.game.GameCanvas;

public abstract class FullCn
extends GameCanvas {
    boolean setFullScreen;
    int[] codes;
    int[] CodeFrom;
    int[] CodeTo;
    int n;

    protected FullCn() {
        super(false);
        this.Init();
    }

    protected FullCn(boolean flag) {
        super(flag);
        this.Init();
    }

    private void Init() {
        this.setFullScreen = true;
        this.n = 7;
        this.codes = new int[13];
        this.CodeFrom = new int[]{-1, -4, -59, -61, -62, -60, -26, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202};
        this.CodeTo = new int[]{-6, -7, -1, -3, -4, -2, -5, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202, -202};
        this.setFullScreenMode(this.setFullScreen);
        for (int i = 0; i < 13; ++i) {
            this.codes[i] = i != 0 && i != 3 && i != 4 && i != 7 ? this.keyCodeConvert(super.getKeyCode(i)) : 0;
        }
    }

    private int keyCodeConvert(int i) {
        for (int j = 0; j < this.n; ++j) {
            if (this.CodeFrom[j] != i) continue;
            return this.CodeTo[j];
        }
        return i;
    }

    protected void keyPressed(int i) {
        this.KEYPRESSED(this.keyCodeConvert(i));
    }

    protected void keyReleased(int i) {
        this.KEYRELEASED(this.keyCodeConvert(i));
    }

    protected void keyRepeated(int i) {
        this.KEYREPEATED(this.keyCodeConvert(i));
    }

    protected void KEYPRESSED(int i) {
    }

    protected void KEYRELEASED(int i) {
    }

    protected void KEYREPEATED(int i) {
    }

    public int getGameAction(int i) {
        boolean flag = false;
        for (int k = 0; k < this.n; ++k) {
            if (this.CodeTo[k] != i) continue;
            flag = true;
            int j = super.getGameAction(this.CodeFrom[k]);
            if (j == 0) continue;
            return j;
        }
        return flag ? 0 : super.getGameAction(i);
    }

    public int getKeyCode(int i) {
        return this.codes[i] == 0 ? super.getKeyCode(i) : this.codes[i];
    }

    public String getKeyName(int i) {
        for (int j = 0; j < this.n; ++j) {
            if (this.CodeTo[j] != i) continue;
            return super.getKeyName(this.CodeFrom[j]);
        }
        return super.getKeyName(i);
    }

    public int getWidth() {
        return 240;
    }

    public int getHeight() {
        return 320;
    }

    protected void sizeChanged(int i, int j) {
        this.setFullScreenMode(this.setFullScreen);
    }
}

