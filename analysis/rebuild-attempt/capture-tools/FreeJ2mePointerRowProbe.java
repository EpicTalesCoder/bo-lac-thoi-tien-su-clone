import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Bounded single-click probe for one visible row of the language menu. */
public final class FreeJ2mePointerRowProbe {
    private static void dumpState(String label) throws Exception {
        Object canvas = Mobile.getDisplay().getCurrent();
        System.out.println(label + " canvas=" + canvas.getClass().getName());
        java.lang.reflect.Field midletField;
        try {
            midletField = canvas.getClass().getDeclaredField("var_tribes_a");
        } catch (NoSuchFieldException absentBeforeGameplayCanvas) {
            return;
        }
        midletField.setAccessible(true);
        Object midlet = midletField.get(canvas);
        String[] names = {"var_byte_v", "var_byte_w", "var_byte_Q", "var_int_Z", "aK", "aH", "aJ", "aG", "aY", "aZ", "var_int_ab", "var_int_N"};
        StringBuilder state = new StringBuilder(label);
        for (String name : names) {
            try {
                java.lang.reflect.Field field = canvas.getClass().getDeclaredField(name);
                field.setAccessible(true);
                state.append(' ').append(name).append('=').append(field.get(canvas));
            } catch (NoSuchFieldException ignored) {
                // Fields added in later probing iterations are optional diagnostics.
            }
        }
        state.append(" midlet=").append(midlet.getClass().getName());
        java.lang.reflect.Method hitTest = canvas.getClass().getDeclaredMethod("updateMenuPointer", int.class, int.class);
        hitTest.setAccessible(true);
        java.lang.reflect.Field offsetsField = canvas.getClass().getDeclaredField("var_short_arr_a");
        offsetsField.setAccessible(true);
        short[] offsets = (short[])offsetsField.get(canvas);
        java.lang.reflect.Field dataField = canvas.getClass().getDeclaredField("var_byte_arr_a");
        dataField.setAccessible(true);
        byte[] data = (byte[])dataField.get(canvas);
        int stateIndex = ((Byte)fieldValue(canvas, "var_byte_Q")).byteValue();
        int countOffset = offsets[152] + stateIndex;
        int start = data[countOffset] & 255, end = data[countOffset + 1] & 255;
        int rowHeight = (data[offsets[283] + 2] & 255) + 6;
        int menuBaseY = stateIndex == 14 ? 94 : ((Integer)fieldValue(canvas, "aK")).intValue() - (end-start)*rowHeight/2;
        state.append(" entries=").append(start).append("..").append(end).append(" rowHeight=").append(rowHeight)
             .append(" firstRowVisibleY=").append(menuBaseY - 8)
             .append(" acceptedY=");
        for (int testY = 40; testY <= 240; testY += 5) {
            boolean accepted = ((Boolean)hitTest.invoke(canvas, 88, testY)).booleanValue();
            if (accepted) state.append(testY).append(':').append(fieldValue(canvas, "var_int_Z")).append(',');
        }
        System.out.println(state.toString());
    }

    private static Object fieldValue(Object target, String name) throws Exception {
        java.lang.reflect.Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        return field.get(target);
    }

    private static void capture(MobilePlatform platform, File out) throws Exception {
        if (!ImageIO.write(platform.getLCD(), "png", out)) {
            throw new IllegalStateException("PNG writer unavailable");
        }
        System.out.println("captured " + out.getAbsolutePath());
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 4) {
            System.err.println("usage: FreeJ2mePointerRowProbe <jar> <new-output-dir> <x> <y>");
            System.exit(2);
        }
        File dir = new File(args[1]);
        if (!dir.mkdir()) throw new IllegalStateException("output directory must be new: " + dir);
        int x = Integer.parseInt(args[2]);
        int y = Integer.parseInt(args[3]);
        int initialFireCount = Integer.parseInt(System.getProperty("probe.fires", "0"));
        final boolean clickOnly = "click".equals(System.getProperty("probe.op", "click"));
        MobilePlatform platform = new MobilePlatform(240, 320);
        Mobile.setPlatform(platform);
        platform.setPainter(new Runnable() { public void run() {} });
        System.out.println("loadJar=" + platform.loadJar(new File(args[0]).toURI().toURL().toString()));
        platform.runJar();
        Thread.sleep(12000L);
        for (int i = 0; i < initialFireCount; i++) {
            platform.keyPressed(Mobile.KEY_NUM5);
            Thread.sleep(180L);
            platform.keyReleased(Mobile.KEY_NUM5);
            Thread.sleep(2200L);
            System.out.println("startup fire " + (i + 1));
        }
        dumpState("before");
        capture(platform, new File(dir, "before.png"));
        platform.pointerPressed(x, y);
        Thread.sleep(180L);
        if (!clickOnly) {
            platform.pointerDragged(x, y);
        }
        platform.pointerReleased(x, y);
        dumpState("immediate");
        Thread.sleep(2500L);
        dumpState("settled");
        capture(platform, new File(dir, "after.png"));
        System.exit(0);
    }
}
