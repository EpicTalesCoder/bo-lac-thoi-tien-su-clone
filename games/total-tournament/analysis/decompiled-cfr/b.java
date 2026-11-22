/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  javax.microedition.lcdui.Image
 *  javax.microedition.rms.RecordStore
 */
import java.io.DataInputStream;
import java.io.FilterInputStream;
import java.io.InputStream;
import javax.microedition.lcdui.Image;
import javax.microedition.rms.RecordStore;

public final class b {
    static byte[] a;
    private static int e;
    static boolean b;
    static boolean c;
    private static String f;
    public static b d;

    static {
        e = e.x;
        f = e.M;
        a = new byte[e];
        c = false;
        b = true;
    }

    /*
     * Unable to fully structure code
     * Could not resolve type clashes
     */
    static final Image a(String var0) {
        var0 = b.d.a((String)var0, -1);
        try {
            return Image.createImage((byte[])var0, (int)0, (int)((Object)var0).length);
        }
        catch (Exception v0) {
            try {
                return Image.createImage((byte[])b.a((byte[])var0, 100), (int)0, (int)((Object)var0).length);
            }
            catch (Exception v1) {
                b.a((byte[])var0, 100);
                var2_1 = var0[2] - 3;
                var1_2 = var0;
                var3_3 = ((Object)var1_2).length;
                var4_4 = (byte)var2_1;
                var2_1 = (reference)false;
                ** while (var2_1 < var3_3)
            }
        }
lbl-1000:
        // 1 sources

        {
            var1_2[var2_1] = (byte)(var1_2[var2_1] ^ var4_4);
            var4_4 = (byte)(var4_4 + 1);
            ++var2_1;
            continue;
        }
lbl20:
        // 1 sources

        return Image.createImage((byte[])var1_2, (int)3, (int)(((Object)var0).length - 3));
    }

    private static byte[] a(String string, byte[] byArray) {
        boolean bl = false;
        try {
            RecordStore recordStore = RecordStore.openRecordStore((String)string, (boolean)true);
            if (recordStore.getNumRecords() == 1) {
                recordStore.getRecord(1, byArray, 0);
                bl = true;
            }
            recordStore.closeRecordStore();
        }
        catch (Exception exception) {}
        if (!bl) {
            e.ac = true;
            e.v = 0;
            e.n = e.o;
            e.P = 0;
            byArray = b.a(byArray);
            b.b(string, byArray);
        }
        return byArray;
    }

    private static final void b(String string, byte[] byArray) {
        try {
            RecordStore recordStore = RecordStore.openRecordStore((String)string, (boolean)true);
            if (recordStore.getNumRecords() == 1) {
                recordStore.closeRecordStore();
                if (RecordStore.listRecordStores() != null) {
                    RecordStore.deleteRecordStore((String)string);
                }
                recordStore = RecordStore.openRecordStore((String)string, (boolean)true);
            }
            recordStore.addRecord(byArray, 0, byArray.length);
            recordStore.closeRecordStore();
            return;
        }
        catch (Exception exception) {
            return;
        }
    }

    private static byte[] a(byte[] byArray, int n) {
        int n2 = byArray.length;
        int n3 = 0;
        while (n3 < n2) {
            byArray[n3] = (byte)(byArray[n3] ^ n);
            if (++n > 255) {
                n = 0;
            }
            ++n3;
        }
        return byArray;
    }

    private static String d(String string) {
        try {
            if (string.length() > 0) {
                if (string.charAt(0) != '/') {
                    string = "/" + string;
                }
            } else {
                string = "/" + string;
            }
            if (string.length() > 3) {
                if (string.charAt(string.length() - 4) != '.') {
                    string = string + ".png";
                }
            } else {
                string = string + ".png";
            }
        }
        catch (Exception exception) {}
        return string;
    }

    static final void a() {
        if (b) {
            a = b.a(f, a);
        }
        b = false;
        byte[] byArray = a;
        e.ac = true;
        if (a[2] < 1) {
            e.ac = false;
        }
        e.v = byArray[3];
        e.n = byArray[5];
        if (e.n > e.o) {
            e.n = e.o;
        }
        e.P = e.a(byArray[6], byArray[7]);
        a = byArray;
    }

    static final void b() {
        a = b.a(a);
        if (c) {
            b.b(f, a);
        }
        c = false;
    }

    /*
     * Enabled aggressive block sorting
     * Enabled unnecessary exception pruning
     * Enabled aggressive exception aggregation
     */
    private int e(String string) {
        string = b.d(string);
        int n = 0;
        int n2 = -1;
        try {
            InputStream inputStream = inputStream.getClass().getResourceAsStream(string);
            if (inputStream == null) {
                return -1;
            }
            while (true) {
                if (n == -1) {
                    inputStream.close();
                    return n2;
                }
                n = inputStream.read();
                ++n2;
            }
        }
        catch (Exception exception) {
            return -1;
        }
    }

    public final String[][] b(String string) {
        String[][] stringArray = stringArray.a(string, ' ');
        int n = stringArray.length();
        String[][] stringArrayArray = new String[n][];
        int n2 = 0;
        int n3 = n;
        stringArrayArray[0] = new String[n3];
        int n4 = 0;
        int n5 = 0;
        int n6 = 0;
        char c2 = '\u0000';
        char c3 = '\u0000';
        n4 = 0;
        while (n4 < n) {
            c2 = stringArray.charAt(n4);
            if (c2 == '=' || c2 == '\r' || c2 == '\n') {
                stringArrayArray[n2][n6] = stringArray.substring(n5, n4);
                n5 = ++n4;
                ++n6;
            }
            if (c2 == '\r' || c2 == '\n') {
                c3 = stringArray.charAt(n4);
                if ((c3 == '\n' || c3 == '\r') && c3 != c2) {
                    n5 = ++n4;
                }
                n6 = 0;
                stringArrayArray[++n2] = new String[n3];
            }
            ++n4;
        }
        if (n4 > n5 && n5 < n) {
            stringArrayArray[n2][n6] = stringArray.substring(n5, n);
            ++n2;
        }
        stringArray = new String[n2][];
        n = 0;
        while (n < n2) {
            n4 = 0;
            while (n4 < n3) {
                if (stringArrayArray[n][n4] == null) break;
                ++n4;
            }
            stringArray[n] = new String[n4];
            System.arraycopy(stringArrayArray[n], 0, stringArray[n], 0, n4);
            ++n;
        }
        return stringArray;
    }

    protected final byte[] a(String string, int n) {
        if (n < 0) {
            n = ((b)((Object)inputStream)).e(string);
        }
        string = b.d(string);
        if (n <= 0) {
            return null;
        }
        try {
            Class.forName("com.nokia.mid.ui.FullCanvas");
            return ((b)((Object)inputStream)).b(string, n);
        }
        catch (Exception exception) {
            byte[] byArray = new byte[n];
            try {
                InputStream inputStream = inputStream.getClass().getResourceAsStream(string);
                inputStream.read(byArray);
                inputStream.close();
            }
            catch (Exception exception2) {}
            return byArray;
        }
    }

    protected final byte[] a(String string, int n, int n2) {
        Object object = ((b)object).a(string, n);
        n2 = (byte)n2;
        int n3 = 0;
        while (n3 < n) {
            object[n3] = (byte)(object[n3] ^ n2);
            n2 = (byte)(n2 + 1);
            ++n3;
        }
        return object;
    }

    private final byte[] b(String string, int n) {
        byte[] byArray = new byte[n];
        try {
            Object object = object.getClass().getResourceAsStream(string);
            if (object == null) {
                return byArray;
            }
            object = new DataInputStream((InputStream)object);
            int n2 = 0;
            int n3 = 0;
            while ((n2 = ((DataInputStream)object).read(byArray, n3, byArray.length - n3)) != -1 && (n3 += n2) < byArray.length) {
            }
            ((FilterInputStream)object).close();
        }
        catch (Exception exception) {}
        return byArray;
    }

    private String a(String string, char c2) {
        c2 = (char)((b)object).e(string);
        String string2 = "";
        Object object = ((b)object).a(string, (int)c2);
        int n = 0;
        if (object[0] == 95) {
            n = 2;
        }
        int n2 = n;
        Object object2 = 0;
        int n3 = ((Object)object).length - n;
        object2 = n3 + n;
        int n4 = n;
        while (n4 < object2) {
            if (object[n4] == false) {
                n3 = n4 - n;
                c2 = (char)n4;
                break;
            }
            ++n4;
        }
        char[] cArray = new char[n3];
        int n5 = 0;
        while (n5 < n3) {
            Object object3 = object[n5 + n];
            object2 = object3;
            if (object3 < 0) {
                object2 += 256;
            }
            cArray[n5] = (char)object2;
            ++n5;
        }
        while (n2 < c2) {
            Object object4 = object[n2];
            object2 = object4;
            if (object4 < 0) {
                object2 += 256;
            }
            if (object2 == 0) break;
            if (object2 == 32) {
                cArray[n2 - n] = 32;
            }
            if (object2 < 10) {
                cArray[n2 - n] = 32;
            }
            if (object2 >= 192 && object2 <= 255) {
                cArray[n2 - n] = (char)(object2 += 848);
            }
            ++n2;
        }
        try {
            string2 = new String(cArray);
        }
        catch (Exception exception) {}
        return string2;
    }

    public final String c(String string) {
        return this.a(string, ' ');
    }

    static String[] a(String string, a stringArray, int n, boolean bl) {
        int n2 = string.length();
        String[] stringArray2 = new String[n2];
        int n3 = 0;
        int n4 = 0;
        int n5 = 0;
        int n6 = 0;
        int n7 = 0;
        int n8 = 0;
        int n9 = 0;
        int n10 = 1;
        int n11 = 0;
        n3 = 0;
        int n12 = 0;
        while (n12 < n2 + 1) {
            int n13 = n12 >= n2 ? 10 : (int)string.charAt(n12);
            n6 = n13;
            n3 = stringArray.a((char)n13);
            if (n13 != 10 && n13 != 13) {
                n5 += n3;
                n4 += n3;
            }
            switch (n6) {
                case 32: {
                    n10 = n12 + 1;
                    n4 = 0;
                    break;
                }
                case 10: 
                case 13: {
                    n10 = n12;
                    n5 = n + 1;
                    n4 = 0;
                    if (n12 < n2) {
                        if (++n12 < n2) {
                            n3 = n13;
                            char c2 = string.charAt(n12);
                            n13 = c2;
                            if (c2 != '\n' && n13 != 13 || n13 != n3) {
                                // empty if block
                            }
                        }
                        n11 = ++n12;
                        --n12;
                    } else {
                        n11 = n2;
                    }
                    n13 = 10;
                }
            }
            if (!(n5 > n && bl || n13 == 10)) {
                ++n7;
            } else {
                if (n10 == n9 && n7 > 0) {
                    n10 = n9 + n7;
                }
                stringArray2[n8] = n10 > n9 ? string.substring(n9, n10) : "";
                n9 = n10;
                if (n9 < n11) {
                    n9 = n11;
                }
                n10 = n9;
                n5 = n4;
                n4 = 0;
                n7 = 0;
                ++n8;
            }
            ++n12;
        }
        int n14 = n8;
        stringArray = null;
        stringArray = new String[n14];
        System.arraycopy(stringArray2, 0, stringArray, 0, n14);
        return stringArray;
    }

    public static final void c() {
        d = null;
    }

    public static final void d() {
        d = new b();
    }

    private static final byte[] a(byte[] byArray) {
        b.a[2] = e.ac ? (byte)1 : 0;
        byArray[3] = e.v;
        byArray[5] = e.n;
        byte[] byArray2 = e.b(e.P);
        byArray[6] = byArray2[0];
        byArray[7] = byArray2[1];
        return byArray;
    }
}

