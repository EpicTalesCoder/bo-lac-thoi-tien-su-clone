import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Bounded headless FreeJ2ME multi-frame capture for side-by-side visual smoke tests. */
public final class FreeJ2meCaptureSequence {
    private static void capture(MobilePlatform platform, String path, String label) throws Exception {
        boolean ok = ImageIO.write(platform.getLCD(), "png", new File(path));
        System.out.println(label + " written=" + ok + " size=" + platform.getLCD().getWidth() + "x" + platform.getLCD().getHeight());
    }
    public static void main(String[] args) throws Exception {
        if (args.length != 2) {
            System.err.println("usage: FreeJ2meCaptureSequence <midlet.jar> <output-prefix>");
            System.exit(2);
        }
        MobilePlatform platform = new MobilePlatform(240, 320);
        Mobile.setPlatform(platform);
        String jarUrl = new File(args[0]).toURI().toURL().toString();
        System.out.println("loadJar=" + platform.loadJar(jarUrl));
        platform.setPainter(new Runnable() { public void run() { } });
        platform.runJar();
        long[] times = {3000L, 3000L, 3000L, 3000L};
        String[] labels = {"t03", "t06", "t09", "t12"};
        for (int i=0; i<times.length; i++) {
            Thread.sleep(times[i]);
            capture(platform, args[1] + "-" + labels[i] + ".png", labels[i]);
            if (i==2) {
                platform.keyPressed(Mobile.KEY_NUM5);
                Thread.sleep(200L);
                platform.keyReleased(Mobile.KEY_NUM5);
            }
        }
        System.exit(0);
    }
}
