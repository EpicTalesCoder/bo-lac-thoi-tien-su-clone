package com.nokia.mid.ui;

import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public class DirectGraphicsImplemented implements DirectGraphics {
   private Graphics my_g = null;

   protected DirectGraphicsImplemented(Graphics var1) {
      this.my_g = var1;
   }

   public void setARGBColor(int var1) {
      this.my_g.setColor(var1);
   }

   public void drawTriangle(int var1, int var2, int var3, int var4, int var5, int var6, int var7) {
      this.my_g.setColor(var7);
      this.my_g.drawLine(var1, var2, var3, var4);
      this.my_g.drawLine(var3, var4, var5, var6);
      this.my_g.drawLine(var5, var6, var1, var2);
   }

   public void fillTriangle(int var1, int var2, int var3, int var4, int var5, int var6, int var7) {
      this.drawTriangle(var1, var2, var3, var4, var5, var6, var7);
   }

   public void drawPolygon(int[] var1, int var2, int[] var3, int var4, int var5, int var6) {
      this.my_g.setColor(var6);

      for (int var7 = 0; var7 < var5 - 1; var7++) {
         this.my_g.drawLine(var1[var2 + var7], var3[var4 + var7], var1[var2 + var7 + 1], var3[var4 + var7 + 1]);
      }
   }

   public void fillPolygon(int[] var1, int var2, int[] var3, int var4, int var5, int var6) {
      this.drawPolygon(var1, var2, var3, var4, var5, var6);
   }

   public int getNativePixelFormat() {
      return 888;
   }

   public int getAlphaComponent() {
      return 0;
   }

   public void drawImage(Image var1, int var2, int var3, int var4, int var5) {
      if (var5 == 0) {
         this.my_g.drawImage(var1, var2, var3, var4);
      } else {
         this.my_g.drawRegion(var1, 0, 0, var1.getWidth(), var1.getHeight(), (var5 & 8192) > 0 ? 2 : 0, var2, var3, var4);
      }
   }

   public void drawPixels(int[] var1, boolean var2, int var3, int var4, int var5, int var6, int var7, int var8, int var9, int var10) {
      for (int var11 = var5; var11 < var5 + var7; var11++) {
         for (int var12 = var6; var12 < var6 + var8; var12++) {
            this.my_g.setColor(var1[var3 + (var11 - var5) + (var12 - var6) * var4]);
            this.my_g.drawLine(var11, var12, var11, var12);
         }
      }
   }

   public void drawPixels(short[] var1, boolean var2, int var3, int var4, int var5, int var6, int var7, int var8, int var9, int var10) {
      if (var10 == 4444) {
         for (int var11 = var5; var11 < var5 + var7; var11++) {
            for (int var12 = var6; var12 < var6 + var8; var12++) {
               if ((var1[var3 + (var11 - var5) + (var12 - var6) * var4] & '\uf000') != 0) {
                  int var13 = 240 & var1[var3 + (var11 - var5) + (var12 - var6) * var4] << 4;
                  var13 |= 61440 & var1[var3 + (var11 - var5) + (var12 - var6) * var4] << 8;
                  var13 |= 15728640 & var1[var3 + (var11 - var5) + (var12 - var6) * var4] << 12;
                  this.my_g.setColor(var13);
                  this.my_g.drawLine(var11, var12, var11, var12);
               }
            }
         }
      }
   }

   public void drawPixels(byte[] var1, byte[] var2, int var3, int var4, int var5, int var6, int var7, int var8, int var9, int var10) {
      this.my_g.drawLine(var5, var6, var7, var8);
   }

   public void getPixels(int[] var1, int var2, int var3, int var4, int var5, int var6, int var7, int var8) {
   }

   public void getPixels(byte[] var1, byte[] var2, int var3, int var4, int var5, int var6, int var7, int var8, int var9) {
   }

   public void getPixels(short[] var1, int var2, int var3, int var4, int var5, int var6, int var7, int var8) {
   }
}
