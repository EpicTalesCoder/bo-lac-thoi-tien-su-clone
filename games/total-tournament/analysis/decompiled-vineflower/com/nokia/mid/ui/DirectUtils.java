package com.nokia.mid.ui;

import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

public abstract class DirectUtils {
   public static DirectGraphics getDirectGraphics(Graphics var0) {
      return new DirectGraphicsImplemented(var0);
   }

   public static Image createImage(byte[] var0, int var1, int var2) {
      return Image.createImage(var0, var1, var2);
   }

   public static Image createImage(int var0, int var1, int var2) {
      Image var3 = Image.createImage(var0, var1);
      Graphics var4 = var3.getGraphics();
      int var5 = var4.getColor();
      var4.setColor(16777215 & var2);
      var4.fillRect(0, 0, var0 - 1, var1 - 1);
      var4.setColor(var5);
      return var3;
   }
}
