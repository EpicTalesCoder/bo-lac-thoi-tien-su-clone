import java.io.File;
import javax.imageio.ImageIO;
import org.recompile.mobile.Mobile;
import org.recompile.mobile.MobilePlatform;

/** Small pointer interaction demo: click the canvas and move/confirm map cursor. */
public final class FreeJ2meMouseDemo {
    public static void main(String[] args) throws Exception {
        if (args.length != 2) { System.err.println("usage: FreeJ2meMouseDemo <jar> <new-output-dir>"); System.exit(2); }
        File dir = new File(args[1]); if (!dir.mkdir()) throw new IllegalStateException("new output directory required: " + dir);
        MobilePlatform p = new MobilePlatform(240, 320); Mobile.setPlatform(p); p.setPainter(new Runnable() { public void run() {} });
        System.out.println("loadJar=" + p.loadJar(new File(args[0]).toURI().toURL().toString())); p.runJar();
        int step=0;
        while(step<20) {
            int x,y;
            try { x=Integer.parseInt(System.getProperty("mouse.x")); y=Integer.parseInt(System.getProperty("mouse.y")); }
            catch(Exception ex) { Thread.sleep(200L); continue; }
            System.clearProperty("mouse.x"); System.clearProperty("mouse.y");
            String op=System.getProperty("mouse.op","move");
            if("click".equals(op)) { p.pointerPressed(x,y); p.pointerReleased(x,y); }
            else { p.pointerPressed(x,y); p.pointerDragged(x,y); p.pointerReleased(x,y); }
            Thread.sleep(300L);
            File out=new File(dir,String.format("step-%02d.png",++step));
            ImageIO.write(p.getLCD(),"png",out); System.out.println("captured "+out.getName()+" after "+op+" at "+x+","+y);
        }
        System.exit(0);
    }
}
