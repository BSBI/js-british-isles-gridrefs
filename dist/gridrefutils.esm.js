class S{static tetradOffsets={E:[0,8e3],J:[2e3,8e3],P:[4e3,8e3],U:[6e3,8e3],Z:[8e3,8e3],D:[0,6e3],I:[2e3,6e3],N:[4e3,6e3],T:[6e3,6e3],Y:[8e3,6e3],C:[0,4e3],H:[2e3,4e3],M:[4e3,4e3],S:[6e3,4e3],X:[8e3,4e3],B:[0,2e3],G:[2e3,2e3],L:[4e3,2e3],R:[6e3,2e3],W:[8e3,2e3],A:[0,0],F:[2e3,0],K:[4e3,0],Q:[6e3,0],V:[8e3,0]};static quadrantOffsets={NW:[0,5e3],NE:[5e3,5e3],SW:[0,0],SE:[5e3,0]};static letterMapping={A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,J:8,K:9,L:10,M:11,N:12,O:13,P:14,Q:15,R:16,S:17,T:18,U:19,V:20,W:21,X:22,Y:23,Z:24};static tetradLetters="ABCDEFGHIJKLMNPQRSTUVWXYZ";preciseGridRef="";length=0;hectad="";tetrad="";tetradLetter="";quadrant="";quadrantCode="";gridCoords=null;error=!1;errorMessage="";set_tetrad(){if(this.tetradLetter=S.tetradLetters.charAt(5*(Math.floor(this.gridCoords.x%1e4/1e3)>>1)+(Math.floor(this.gridCoords.y%1e4/1e3)>>1)),!this.tetradLetter)throw new Error("Failed to get tetrad letter when processing '"+this.preciseGridRef+"', easting="+this.gridCoords.x+" northing="+this.gridCoords.y);this.tetrad=this.hectad+this.tetradLetter}static get_normalized_precision(S,N){return S>2e3?1e4:S>1e3?2e3:S>100?1e3:S>10?100:S>1?10:N||1}}const N=Math.PI/180,t=180/Math.PI;class e{lat;lng;constructor(S,N){this.lat=S,this.lng=N}static _transform(S,t,T,r,s,a,h,i,n,o,M,d,H,O){const l=1e-6*O;let g=T/Math.sqrt(1-r*(Math.sin(S)*Math.sin(S)));const c=(g+s)*Math.cos(S)*Math.cos(t),J=(g+s)*Math.cos(S)*Math.sin(t),U=((1-r)*g+s)*Math.sin(S),L=M/3600*N,C=d/3600*N,Y=H/3600*N,u=c+c*l-J*Y+U*C+i,f=c*Y+J+J*l-U*L+n,P=-1*c*C+J*L+U+U*l+o;t=Math.atan(f/u);const D=Math.sqrt(u*u+f*f);S=Math.atan(P/(D*(1-h))),g=a/Math.sqrt(1-h*(Math.sin(S)*Math.sin(S)));let K=1,X=0;for(;K>.001;)X=Math.atan((P+h*g*Math.sin(S))/D),K=Math.abs(X-S),S=X;return new e(S,t)}static _Marc(S,N,t,e){return S*((1+N+5/4*(N*N)+5/4*(N*N*N))*(e-t)-(3*N+N*N*3+21/8*(N*N*N))*Math.sin(e-t)*Math.cos(e+t)+(15/8*(N*N)+15/8*(N*N*N))*Math.sin(2*(e-t))*Math.cos(2*(e+t))-35/24*(N*N*N)*Math.sin(3*(e-t))*Math.cos(3*(e+t)))}}class T extends e{constructor(S,N){super(S,N)}}class r extends e{constructor(S,N){super(S,N)}to_WGS84(){let S=6377563.396,e=.00667054007;const r=this.lat*N,s=Math.sin(r),a=this.lng*N,h=S/Math.sqrt(1-e*(s*s)),i=h*Math.cos(r)*Math.cos(a),n=h*Math.cos(r)*Math.sin(a),o=(1-e)*h*s,M=-204894e-10,d=7.28190110241429e-7,H=119748977294801e-20,O=446.448+i*(1+M)+-d*n+H*o,l=408261589226812e-20*i-124.157+n*(1+M)+-d*o,g=542.06+-H*i+d*n+o*(1+M);S=6378137,e=.00669438003;const c=Math.sqrt(O*O+l*l);let J=Math.atan(g/(c*(1-e)));for(let N=1;N<10;++N){let N=Math.sin(J);J=Math.atan((g+e*(S/Math.sqrt(1-e*(N*N)))*N)/c)}return new T(t*J,t*Math.atan(l/O))}static from_wgs84(S){const e=S.lat*N,T=S.lng*N,s=.00669438037928458,a=.0066705397616,h=20.4894*1e-6;let i=6378137/Math.sqrt(1-s*Math.sin(e)*Math.sin(e));const n=(i+0)*Math.cos(e)*Math.cos(T),o=(i+0)*Math.cos(e)*Math.sin(T),M=((1-s)*i+0)*Math.sin(e),d=-.1502/3600*N,H=-.247/3600*N,O=-.8421/3600*N,l=n+n*h-o*O+M*H-446.448,g=n*O+o+o*h-M*d+125.157,c=-1*n*H+o*d+M+M*h+-542.06,J=Math.atan(g/l),U=Math.sqrt(l*l+g*g);let L=Math.atan(c/(U*(1-a)));i=6377563.396/Math.sqrt(1-a*(Math.sin(L)*Math.sin(L)));let C=1,Y=0;for(;C>.001;)Y=Math.atan((c+a*i*Math.sin(L))/U),C=Math.abs(Y-L),L=Y;return new r(L*t,J*t)}}class s extends e{constructor(S,N){super(S,N)}to_WGS84(){const S=e._transform(this.lat*N,this.lng*N,6377340.189,.00667054015,0,6378137,.00669438037928458,482.53,-130.596,564.557,-1.042,-.214,-.631,-8.15);return new T(S.lat*t,S.lng*t)}static from_wgs84(S){const T=S.lat*N,r=S.lng*N,a=e._transform(T,r,6378137,.00669438037928458,0,6377340.189,.00667054015,-482.53,130.596,-564.557,1.042,.214,.631,8.15);return new s(a.lat*t,a.lng*t)}}class a extends e{constructor(S,N){super(S,N)}static from_wgs84(S){const T=S.lat*N,r=S.lng*N,s=e._transform(T,r,6378137,.00669438037928458,0,6378388,.0067226700223333,83.901,98.127,118.635,0,0,0,0);return new a(s.lat*t,s.lng*t)}}class h{x;y;constructor(){}to_latLng(){}to_gridref(S){}static tetradLetters="ABCDEFGHIJKLMNPQRSTUVWXYZ";static tetradLettersRowFirst="AFKQVBGLRWCHMSXDINTYEJPUZ";static from_latlng(S,N){if(N>=-8.74&&S>49.88){const t=h._from_gb_latlng(r.from_wgs84(new T(S,N)));if(t.x>=0&&t.is_gb_hectad())return t}if(N<-5.3&&S>51.34&&N>-11&&S<55.73){const t=h._from_ie_latlng(s.from_wgs84(new T(S,N)));return t.x<0||t.y<0?null:t}{const t=h._from_ci_latlng(a.from_wgs84(new T(S,N)));if(t.x>=5e5&&t.x<6e5&&t.y>=54e5&&t.y<56e5)return t}return null}static _from_gb_latlng(S){const t=S.lat*N,T=S.lng*N,r=.9996012717,s=.0066705397616,a=6377563.396*r,h=6356256.91*r,i=Math.sin(t)*Math.sin(t),o=a/Math.sqrt(1-s*i),M=o*(1-s)/(1-s*i),d=o/M-1,H=T- -.03490658503988659,O=o*Math.cos(t),l=Math.pow(Math.cos(t),3),g=Math.tan(t)*Math.tan(t),c=o/6*l*(o/M-g),J=Math.pow(Math.cos(t),5),U=Math.pow(Math.tan(t),4),L=o/120*J*(5-18*g+U+14*d-58*g*d),C=4e5+H*O+Math.pow(H,3)*c+Math.pow(H,5)*L,Y=e._Marc(h,.0016732202503250907,.8552113334772214,t)+-1e5,u=o/2*Math.sin(t)*Math.cos(t),f=o/24*Math.sin(t)*Math.pow(Math.cos(t),3)*(5-Math.pow(Math.tan(t),2)+9*d),P=o/720*Math.sin(t)*J*(61-58*g+U),D=Y+H*H*u+Math.pow(H,4)*f+Math.pow(H,6)*P;return new n(Math.round(C),Math.round(D))}static _from_ie_latlng(S){const t=S.lat*N,T=S.lng*N,r=1.000035,s=.00667054015,a=6377340.189*r,h=6356034.447*r,i=Math.sin(t)*Math.sin(t),n=a/Math.sqrt(1-s*i),M=n*(1-s)/(1-s*i),d=n/M-1,H=T- -.13962634015954636,O=n*Math.cos(t),l=Math.pow(Math.cos(t),3),g=Math.tan(t)*Math.tan(t),c=n/6*l*(n/M-g),J=Math.pow(Math.cos(t),5),U=Math.pow(Math.tan(t),4),L=n/120*J*(5-18*g+U+14*d-58*g*d),C=2e5+H*O+Math.pow(H,3)*c+Math.pow(H,5)*L,Y=e._Marc(h,.0016732203841520518,.9337511498169663,t)+25e4,u=n/2*Math.sin(t)*Math.cos(t),f=n/24*Math.sin(t)*Math.pow(Math.cos(t),3)*(5-Math.pow(Math.tan(t),2)+9*d),P=n/720*Math.sin(t)*J*(61-58*g+U),D=Y+H*H*u+Math.pow(H,4)*f+Math.pow(H,6)*P;return new o(Math.round(C),Math.round(D))}static _from_ci_latlng(S){const t=S.lat*N,T=S.lng*N,r=.9996,s=.0067226700223333,a=6378388*r,h=6356911.946*r,i=Math.sin(t)*Math.sin(t),n=a/Math.sqrt(1-s*i),o=n*(1-s)/(1-s*i),d=n/o-1,H=T- -.0523598775598,O=n*Math.cos(t),l=Math.pow(Math.cos(t),3),g=Math.tan(t)*Math.tan(t),c=n/6*l*(n/o-g),J=Math.pow(Math.cos(t),5),U=Math.pow(Math.tan(t),4),L=n/120*J*(5-18*g+U+14*d-58*g*d),C=5e5+H*O+Math.pow(H,3)*c+Math.pow(H,5)*L,Y=e._Marc(h,.0016863406508729017,0,t)+0,u=n/2*Math.sin(t)*Math.cos(t),f=n/24*Math.sin(t)*Math.pow(Math.cos(t),3)*(5-Math.pow(Math.tan(t),2)+9*d),P=n/720*Math.sin(t)*J*(61-58*g+U),D=Y+H*H*u+Math.pow(H,4)*f+Math.pow(H,6)*P;return new M(Math.round(C),Math.round(D))}static calculate_tetrad(S,N){return S>=0&&N>=0?h.tetradLetters.charAt(5*Math.floor(S%1e4/2e3)+Math.floor(N%1e4/2e3)):""}toString(){return this.x+","+this.y}}const i=function(S,N,t,e){let T="00000"+Math.floor(N),r="00000"+Math.floor(t);if(2e3===e)return S+T.charAt(T.length-5)+r.charAt(r.length-5)+h.calculate_tetrad(N,t);if(1e5===e)return S;{5e3===e&&(e=1e4);let N=Math.round(Math.log10(e));return S+(N?T.slice(-5,-N)+r.slice(-5,-N):T.slice(-5)+r.slice(-5))}};class n extends h{gridCoords=null;constructor(S,N){super(),this.x=S,this.y=N}country="GB";static gbHectads="SV80SV81SV90SV91SW32SW33SW42SW43SW44SW52SW53SW54SW61SW62SW63SW64SW65SW71SW72SW73SW74SW75SW76SW81SW82SW83SW84SW85SW86SW87SW95SW96SW97SS10SS11SS20SS21SS30SW83SW84SW85SW93SW94SW95SW96SW97SW98SX03SX04SX05SX06SX07SX08SX09SX14SX15SX16SX17SX18SX19SX25SX26SX27SX28SX29SX35SX36SX37SX38SX39SX44SX45SX46SX47SS70SS80SS81SS90SS91ST00ST01ST10ST11ST20ST21ST30SX37SX44SX45SX46SX47SX48SX54SX55SX56SX57SX58SX63SX64SX65SX66SX67SX68SX69SX73SX74SX75SX76SX77SX78SX79SX83SX84SX85SX86SX87SX88SX89SX94SX95SX96SX97SX98SX99SY07SY08SY09SY18SY19SY28SY29SY38SY39SS14SS20SS21SS22SS30SS31SS32SS40SS41SS42SS43SS44SS50SS51SS52SS53SS54SS60SS61SS62SS63SS64SS70SS71SS72SS73SS74SS75SS80SS81SS82SS83SS91SS92ST01ST02SX28SX29SX37SX38SX39SX48SX49SX58SX59SX68SX69SX79SS73SS74SS82SS83SS84SS92SS93SS94ST01ST02ST03ST04ST11ST12ST13ST14ST20ST21ST22ST23ST24ST25ST30ST31ST32ST33ST34ST40ST41ST42ST50ST51ST52ST61ST62ST71ST72ST24ST25ST26ST32ST33ST34ST35ST36ST37ST42ST43ST44ST45ST46ST47ST52ST53ST54ST55ST56ST57ST62ST63ST64ST65ST66ST67ST72ST73ST74ST75ST76ST77ST83ST84ST85ST86SP00SP10ST76ST77ST85ST86ST87ST88ST89ST96ST97ST98ST99SU06SU07SU08SU09SU16SU17SU18SU19SU26SU27SU28SU29SU36SU37ST73ST74ST75ST76ST82ST83ST84ST85ST86ST91ST92ST93ST94ST95ST96SU01SU02SU03SU04SU05SU06SU11SU12SU13SU14SU15SU16SU21SU22SU23SU24SU25SU26SU31SU32SU34SU35SU36ST20ST30ST40ST50ST51ST60ST61ST70ST71ST72ST73ST80ST81ST82ST83ST90ST91ST92SU00SU01SU02SU10SU11SY39SY48SY49SY58SY59SY66SY67SY68SY69SY77SY78SY79SY87SY88SY89SY97SY98SY99SZ07SZ08SZ09SZ28SZ38SZ39SZ47SZ48SZ49SZ57SZ58SZ59SZ68SZ69SU00SU01SU02SU10SU11SU12SU20SU21SU22SU23SU30SU31SU32SU33SU40SU41SU42SU43SU50SU51SU52SU60SU61SU62SU70SU71SU72SZ08SZ09SZ19SZ29SZ38SZ39SZ49SZ59SZ69SZ79SU23SU24SU25SU33SU34SU35SU36SU42SU43SU44SU45SU46SU52SU53SU54SU55SU56SU62SU63SU64SU65SU66SU72SU73SU74SU75SU76SU82SU83SU84SU85SU86SU70SU71SU72SU80SU81SU82SU83SU90SU91SU92SU93SZ79SZ89SZ99TQ00TQ01TQ02TQ03TQ10TQ11TQ12TQ13TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ20TQ21TQ22TQ23TQ30TQ31TQ32TQ33TQ40TQ41TQ42TQ43TQ44TQ50TQ51TQ52TQ53TQ54TQ60TQ61TQ62TQ63TQ70TQ71TQ72TQ80TQ81TQ82TQ91TQ92TV49TV59TV69TQ65TQ72TQ73TQ74TQ75TQ76TQ77TQ82TQ83TQ84TQ85TQ86TQ87TQ91TQ92TQ93TQ94TQ95TQ96TQ97TR01TR02TR03TR04TR05TR06TR07TR12TR13TR14TR15TR16TR23TR24TR25TR26TR27TR33TR34TR35TR36TR37TR46TR47TQ35TQ36TQ37TQ38TQ43TQ44TQ45TQ46TQ47TQ48TQ53TQ54TQ55TQ56TQ57TQ58TQ63TQ64TQ65TQ66TQ67TQ72TQ73TQ74TQ75TQ76TQ77TQ78TQ87TQ88TQ97SU83SU84SU85SU86SU93SU94SU95SU96SU97TQ03TQ04TQ05TQ06TQ07TQ13TQ14TQ15TQ16TQ17TQ23TQ24TQ25TQ26TQ27TQ33TQ34TQ35TQ36TQ37TQ38TQ43TQ44TQ45TL30TL40TL50TL60TL70TL80TL90TM00TQ38TQ39TQ47TQ48TQ49TQ57TQ58TQ59TQ67TQ68TQ69TQ77TQ78TQ79TQ88TQ89TQ98TQ99TR08TR09TR19TL30TL31TL34TL40TL41TL42TL43TL44TL50TL51TL52TL53TL54TL60TL61TL62TL63TL64TL70TL71TL72TL73TL74TL80TL81TL82TL83TL84TL90TL91TL92TL93TM01TM02TM03TM11TM12TM13TM21TM22TM23TQ49SP81SP90SP91TL00TL01TL02TL10TL11TL12TL13TL20TL21TL22TL23TL24TL30TL31TL32TL33TL34TL41TL42TL43TL44TL51TL52TQ09TQ19TQ29TQ39TL20TL30TQ06TQ07TQ08TQ09TQ16TQ17TQ18TQ19TQ27TQ28TQ29TQ37TQ38TQ39SP20SP30SP40SP41SP50SU19SU26SU27SU28SU29SU36SU37SU38SU39SU46SU47SU48SU49SU56SU57SU58SU59SU66SU67SU68SU69SU76SU77SU78SU86SU87SU88SU96SU97SU98SP10SP20SP21SP22SP23SP30SP31SP32SP33SP34SP40SP41SP42SP43SP44SP45SP50SP51SP52SP53SP54SP60SP61SP62SP63SP70SU29SU39SU49SU57SU58SU59SU67SU68SU69SU77SU78SU79SP51SP53SP60SP61SP62SP63SP64SP70SP71SP72SP73SP74SP80SP81SP82SP83SP84SP85SP90SP91SP92SP93SP94SP95SU78SU79SU88SU89SU97SU98SU99TL00TL01TQ07TQ08TQ09TG40TG50TM03TM04TM05TM06TM07TM13TM14TM15TM16TM17TM23TM24TM25TM26TM27TM28TM33TM34TM35TM36TM37TM38TM39TM44TM45TM46TM47TM48TM49TM57TM58TM59TL64TL65TL66TL67TL68TL74TL75TL76TL77TL78TL83TL84TL85TL86TL87TL88TL93TL94TL95TL96TL97TL98TM03TM04TM05TM06TM07TM08TG00TG01TG02TG03TG04TG10TG11TG12TG13TG14TG20TG21TG22TG23TG24TG30TG31TG32TG33TG40TG41TG42TG50TG51TM07TM08TM09TM17TM18TM19TM27TM28TM29TM38TM39TM49TM59TF40TF41TF42TF50TF51TF52TF53TF60TF61TF62TF63TF64TF70TF71TF72TF73TF74TF80TF81TF82TF83TF84TF90TF91TF92TF93TF94TG00TG01TG02TG03TG04TL49TL59TL68TL69TL78TL79TL87TL88TL89TL98TL99TM07TM08TM09TF20TF30TF31TF40TF41TF50TL15TL19TL23TL24TL25TL26TL28TL29TL33TL34TL35TL36TL37TL38TL39TL44TL45TL46TL47TL48TL49TL54TL55TL56TL57TL58TL59TL63TL64TL65TL66TL67TL68TL69TL75TL76SP91SP92SP93SP94SP95SP96TL01TL02TL03TL04TL05TL06TL07TL11TL12TL13TL14TL15TL16TL23TL24TL25TL06TL07TL08TL09TL15TL16TL17TL18TL19TL25TL26TL27TL28TL29TL36TL37TL38TL39SK90SP43SP44SP45SP46SP53SP54SP55SP56SP57SP58SP63SP64SP65SP66SP67SP68SP73SP74SP75SP76SP77SP78SP79SP84SP85SP86SP87SP88SP89SP95SP96SP97SP98SP99TF00TF10TF20TL06TL07TL08TL09TL18TL19TL29SO70SO71SO80SO81SO82SO83SO90SO91SO92SO93SO94SP00SP01SP02SP03SP04SP10SP11SP12SP13SP14SP15SP20SP21SP22SP23SP24SP25ST99SU09SU19SU29SO50SO51SO60SO61SO62SO63SO70SO71SO72SO73SO80SO81SO82SO83SO90ST57ST58ST59ST66ST67ST68ST69ST76ST77ST78ST79ST87ST88ST89ST98ST99SO10SO11SO20SO21SO22SO23SO30SO31SO32SO40SO41SO42SO50SO51ST18ST19ST27ST28ST29ST37ST38ST39ST47ST48ST49ST58ST59SO22SO23SO24SO25SO26SO32SO33SO34SO35SO36SO37SO41SO42SO43SO44SO45SO46SO47SO51SO52SO53SO54SO55SO56SO57SO61SO62SO63SO64SO65SO66SO73SO74SO75SO76SO56SO64SO65SO66SO67SO72SO73SO74SO75SO76SO77SO78SO82SO83SO84SO85SO86SO87SO88SO93SO94SO95SO96SO97SO98SO99SP03SP04SP05SP06SP07SP08SP13SP14SP16SP17SP18SK10SK20SK30SP04SP05SP06SP07SP08SP09SP14SP15SP16SP17SP18SP19SP22SP23SP24SP25SP26SP27SP28SP29SP33SP34SP35SP36SP37SP38SP39SP44SP45SP46SP47SP48SP49SP55SP56SP57SP58SJ63SJ70SJ71SJ72SJ73SJ74SJ75SJ80SJ81SJ82SJ83SJ84SJ85SJ86SJ90SJ91SJ92SJ93SJ94SJ95SJ96SK00SK01SK02SK03SK04SK05SK06SK10SK11SK12SK13SK14SK15SK16SK20SK21SK22SO77SO78SO79SO88SO89SO98SO99SP08SP09SP19SP29SJ20SJ21SJ22SJ23SJ30SJ31SJ32SJ33SJ34SJ40SJ41SJ42SJ43SJ50SJ51SJ52SJ53SJ54SJ60SJ61SJ62SJ63SJ64SJ70SJ71SJ72SJ73SJ74SJ80SO17SO18SO27SO28SO29SO37SO38SO39SO46SO47SO48SO49SO56SO57SO58SO59SO66SO67SO68SO69SO77SO78SO79SO88SO89SN50SN60SN61SN70SN71SN80SN81SN90SO00SO01SO10SO11SS38SS39SS48SS49SS58SS59SS68SS69SS77SS78SS79SS87SS88SS89SS96SS97SS98SS99ST06ST07ST08ST09ST16ST17ST18ST19ST26ST27ST28SN70SN71SN74SN80SN81SN82SN83SN84SN85SN86SN90SN91SN92SN93SN94SN95SN96SO00SO01SO02SO03SO04SO05SO06SO10SO11SO12SO13SO14SO21SO22SO23SO24SN86SN87SN96SN97SO04SO05SO06SO07SO08SO13SO14SO15SO16SO17SO18SO24SO25SO26SO27SO36SO37SN01SN02SN10SN11SN12SN20SN21SN22SN23SN24SN30SN31SN32SN33SN34SN40SN41SN42SN43SN44SN50SN51SN52SN53SN54SN60SN61SN62SN63SN64SN65SN71SN72SN73SN74SN75SN81SN82SN83SN84SS39SS49SS59SM50SM62SM70SM71SM72SM73SM80SM81SM82SM83SM84SM90SM91SM92SM93SM94SN00SN01SN02SN03SN04SN10SN11SN12SN13SN14SN22SN23SN24SR89SR99SS09SS19SN14SN15SN24SN25SN33SN34SN35SN36SN44SN45SN46SN54SN55SN56SN57SN58SN64SN65SN66SN67SN68SN69SN74SN75SN76SN77SN78SN79SN84SN85SN86SN87SN88SN89SH70SH71SH80SH81SH90SH91SH92SJ00SJ01SJ02SJ03SJ10SJ11SJ12SJ20SJ21SJ22SJ31SN69SN78SN79SN87SN88SN89SN97SN98SN99SO07SO08SO09SO18SO19SO28SO29SO39SH50SH51SH52SH53SH54SH60SH61SH62SH63SH64SH70SH71SH72SH73SH74SH80SH81SH82SH83SH84SH91SH92SH93SH94SH95SJ03SJ04SJ05SJ13SJ14SN59SN69SN79SH12SH13SH22SH23SH24SH32SH33SH34SH43SH44SH45SH46SH53SH54SH55SH56SH57SH64SH65SH66SH67SH74SH75SH76SH77SH78SH84SH85SH86SH87SH88SH74SH75SH76SH77SH84SH85SH86SH87SH88SH94SH95SH96SH97SH98SJ02SJ03SJ04SJ05SJ06SJ07SJ08SJ12SJ13SJ14SJ15SJ16SJ17SJ22SJ23SJ24SJ25SJ26SJ33SJ34SJ35SJ43SJ44SJ45SJ53SJ54SH97SH98SJ06SJ07SJ08SJ15SJ16SJ17SJ18SJ25SJ26SJ27SJ35SJ36SJ37SH27SH28SH29SH36SH37SH38SH39SH46SH47SH48SH49SH56SH57SH58SH59SH67SH68SK81SK82SK83SK84SK85SK86SK87SK90SK91SK92SK93SK94SK95SK96SK97TF00TF01TF02TF03TF04TF05TF06TF07TF10TF11TF12TF13TF14TF15TF16TF17TF20TF21TF22TF23TF24TF25TF30TF31TF32TF33TF34TF41TF42TF43TF44TF52SE60SE70SE71SE80SE81SE82SE90SE91SE92SK78SK79SK87SK88SK89SK97SK98SK99TA00TA01TA02TA10TA11TA12TA20TA21TA30TA31TA40TF07TF08TF09TF15TF16TF17TF18TF19TF24TF25TF26TF27TF28TF29TF33TF34TF35TF36TF37TF38TF39TF43TF44TF45TF46TF47TF48TF49TF54TF55TF56TF57TF58SK20SK21SK30SK31SK32SK40SK41SK42SK43SK50SK51SK52SK60SK61SK62SK70SK71SK72SK73SK74SK80SK81SK82SK83SK84SK90SK91SP39SP48SP49SP57SP58SP59SP68SP69SP78SP79SP89SP99TF00TF01SE60SE70SK42SK43SK44SK45SK46SK52SK53SK54SK55SK56SK57SK58SK59SK62SK63SK64SK65SK66SK67SK68SK69SK72SK73SK74SK75SK76SK77SK78SK79SK84SK85SK86SK87SK88SK89SK97SJ98SJ99SK03SK06SK07SK08SK09SK11SK12SK13SK14SK15SK16SK17SK18SK19SK21SK22SK23SK24SK25SK26SK27SK28SK31SK32SK33SK34SK35SK36SK37SK38SK42SK43SK44SK45SK46SK47SK48SK53SK56SK57SD90SE00SE10SJ18SJ19SJ27SJ28SJ29SJ35SJ36SJ37SJ38SJ39SJ44SJ45SJ46SJ47SJ48SJ54SJ55SJ56SJ57SJ58SJ63SJ64SJ65SJ66SJ67SJ68SJ69SJ74SJ75SJ76SJ77SJ78SJ79SJ85SJ86SJ87SJ88SJ89SJ96SJ97SJ98SJ99SK06SK07SK08SK09SK19SD20SD21SD22SD30SD31SD32SD40SD41SD42SD50SD51SD52SD53SD60SD61SD62SD63SD70SD71SD72SD73SD74SD80SD81SD82SD83SD84SD90SD91SD92SD93SD94SJ29SJ38SJ39SJ48SJ49SJ58SJ59SJ68SJ69SJ79SJ88SJ89SJ99SD22SD23SD32SD33SD34SD35SD36SD42SD43SD44SD45SD46SD47SD52SD53SD54SD55SD56SD57SD63SD64SD65SD66SD67SD68SD73SD78SE53SE54SE62SE63SE64SE65SE72SE73SE74SE75SE76SE82SE83SE84SE85SE86SE87SE92SE93SE94SE95SE96SE97SE98TA02TA03TA04TA05TA06TA07TA08TA12TA13TA14TA15TA16TA17TA18TA21TA22TA23TA24TA26TA27TA31TA32TA33TA41TA42NZ30NZ31NZ40NZ41NZ42NZ50NZ51NZ52NZ60NZ61NZ62NZ70NZ71NZ72NZ80NZ81NZ90NZ91SE37SE38SE39SE46SE47SE48SE49SE55SE56SE57SE58SE59SE64SE65SE66SE67SE68SE69SE75SE76SE77SE78SE79SE86SE87SE88SE89SE97SE98SE99TA08TA09TA18SD84SD90SD91SD92SD93SD94SD95SE00SE01SE02SE03SE04SE10SE11SE12SE13SE14SE20SE21SE22SE23SE30SE31SE32SE33SE40SE41SE42SE50SE51SE52SE60SE61SE62SE70SE71SE72SE81SE82SK18SK19SK28SK29SK38SK39SK47SK48SK49SK57SK58SK59SK69SD54SD55SD64SD65SD66SD67SD68SD73SD74SD75SD76SD77SD78SD84SD85SD86SD87SD88SD94SD95SD96SD97SD98SE04SE05SE06SE07SE13SE14SE15SE16SE17SE23SE24SE25SE26SE27SE32SE33SE34SE35SE36SE37SE42SE43SE44SE45SE46SE52SE53SE54SE55SE56SE62SE63SE64SE65SE72NY72NY80NY81NY82NY90NY91NY92NZ00NZ01NZ02NZ10NZ11NZ20NZ21NZ30NZ31SD68SD69SD78SD79SD88SD89SD97SD98SD99SE07SE08SE09SE17SE18SE19SE27SE28SE29SE36SE37SE38SE39SE46SE47NY73NY74NY82NY83NY84NY92NY93NY94NY95NZ01NZ02NZ03NZ04NZ05NZ11NZ12NZ13NZ14NZ15NZ16NZ20NZ21NZ22NZ23NZ24NZ25NZ26NZ30NZ31NZ32NZ33NZ34NZ35NZ36NZ41NZ42NZ43NZ44NZ45NZ46NZ52NZ53NT60NT70NT80NT90NU00NU10NU20NY58NY59NY64NY65NY66NY67NY68NY69NY74NY75NY76NY77NY78NY79NY84NY85NY86NY87NY88NY89NY94NY95NY96NY97NY98NY99NZ04NZ05NZ06NZ07NZ08NZ09NZ15NZ16NZ17NZ18NZ19NZ26NZ27NZ28NZ29NZ36NZ37NZ38NZ39NT70NT71NT73NT80NT81NT82NT83NT84NT90NT91NT92NT93NT94NT95NU00NU01NU02NU03NU04NU05NU10NU11NU12NU13NU14NU20NU21NU22NU23NZ09NZ19NY20NY21NY30NY31NY40NY41NY42NY50NY51NY52NY53NY60NY61NY62NY63NY70NY71NY72NY73NY80NY81NY82NY83SD16SD17SD18SD19SD26SD27SD28SD29SD36SD37SD38SD39SD46SD47SD48SD49SD57SD58SD59SD67SD68SD69SD78SD79SD89NX90NX91NX92NX93NY00NY01NY02NY03NY04NY05NY10NY11NY12NY13NY14NY15NY16NY20NY21NY22NY23NY24NY25NY26NY31NY32NY33NY34NY35NY36NY37NY41NY42NY43NY44NY45NY46NY47NY48NY52NY53NY54NY55NY56NY57NY58NY62NY63NY64NY65NY66NY67NY68NY73NY74NY75NY84SD08SD09SD17SD18SD19SD28SD29NX30NX40SC16SC17SC26SC27SC28SC36SC37SC38SC39SC47SC48SC49NS60NS61NS70NS71NS72NS80NS81NS90NT00NT01NT10NT11NT20NT21NT30NX69NX78NX79NX88NX89NX96NX97NX98NX99NY05NY06NY07NY08NY09NY16NY17NY18NY19NY26NY27NY28NY29NY36NY37NY38NY39NY47NY48NY49NS50NS60NX36NX37NX38NX45NX46NX47NX48NX49NX54NX55NX56NX57NX58NX59NX64NX65NX66NX67NX68NX69NX74NX75NX76NX77NX78NX79NX84NX85NX86NX87NX88NX95NX96NX97NX98NY05NY06NW95NW96NW97NX03NX04NX05NX06NX07NX13NX14NX15NX16NX17NX24NX25NX26NX27NX33NX34NX35NX36NX37NX43NX44NX45NX46NS00NS10NS14NS15NS16NS20NS21NS23NS24NS25NS26NS30NS31NS32NS33NS34NS35NS36NS40NS41NS42NS43NS44NS45NS50NS51NS52NS53NS54NS55NS60NS61NS62NS63NS64NS71NS72NS73NX07NX08NX09NX17NX18NX19NX27NX28NX29NX37NX38NX39NX48NX49NX59NS16NS17NS26NS27NS35NS36NS37NS44NS45NS46NS47NS54NS55NS56NS64NS65NS66NS53NS54NS55NS56NS57NS63NS64NS65NS66NS67NS71NS72NS73NS74NS75NS76NS77NS80NS81NS82NS83NS84NS85NS86NS87NS90NS91NS92NS93NS94NS95NS96NT00NT01NT02NT03NT04NT05NT14NT01NT02NT03NT04NT05NT11NT12NT13NT14NT15NT21NT22NT23NT24NT25NT32NT33NT34NT10NT11NT20NT21NT22NT23NT30NT31NT32NT33NT34NT41NT42NT43NT44NT53NT20NT30NT31NT40NT41NT42NT43NT44NT50NT51NT52NT53NT54NT60NT61NT62NT63NT64NT70NT71NT72NT73NT74NT81NT82NT83NY39NY47NY48NY49NY58NY59NY69NT44NT45NT46NT53NT54NT55NT56NT63NT64NT65NT66NT73NT74NT75NT76NT77NT83NT84NT85NT86NT87NT94NT95NT96NT36NT37NT45NT46NT47NT48NT55NT56NT57NT58NT65NT66NT67NT68NT76NT77NS95NS96NT05NT06NT15NT16NT17NT24NT25NT26NT27NT34NT35NT36NT37NT43NT44NT45NT46NS86NS87NS95NS96NS97NS98NT06NT07NT08NT16NT17NO00NO01NO10NO11NO20NO21NO22NO30NO31NO32NO40NO41NO42NO50NO51NO52NO60NO61NS99NT08NT09NT18NT19NT28NT29NT39NT49NT59NT69NN30NN31NN40NN41NS38NS39NS47NS48NS49NS57NS58NS59NS67NS68NS69NS77NS78NS79NS86NS87NS88NS89NS97NS98NN21NN22NN30NN31NN32NN40NN41NN42NN50NN51NN52NN60NN61NN70NN71NN80NN81NN90NN91NO00NS49NS59NS69NS79NS88NS89NS98NS99NT08NT09NN22NN23NN32NN33NN34NN35NN42NN43NN44NN45NN46NN47NN51NN52NN53NN54NN55NN56NN57NN61NN62NN63NN64NN65NN66NN67NN71NN72NN73NN74NN75NN76NN77NN81NN82NN83NN84NN85NN86NN90NN91NN92NN93NN94NN95NN96NO00NO01NO02NO03NO04NO11NO12NO13NO21NN56NN57NN66NN67NN68NN76NN77NN78NN86NN87NN88NN94NN95NN96NN97NN98NO02NO03NO04NO05NO06NO07NO08NO11NO12NO13NO14NO15NO16NO17NO21NO22NO23NO24NO25NO32NO33NO34NO15NO16NO17NO23NO24NO25NO26NO27NO28NO32NO33NO34NO35NO36NO37NO38NO42NO43NO44NO45NO46NO47NO48NO53NO54NO55NO56NO57NO58NO63NO64NO65NO66NO67NO74NO75NO76NJ60NJ70NJ80NJ90NO57NO58NO66NO67NO68NO69NO76NO77NO78NO79NO86NO87NO88NO89NO99NH90NJ00NJ10NJ11NJ20NJ21NJ30NJ31NJ32NJ40NJ41NJ42NJ50NJ51NJ52NJ60NJ61NJ62NJ70NJ71NJ72NJ80NJ81NJ82NJ90NJ91NJ92NK02NN98NN99NO07NO08NO09NO17NO18NO19NO27NO28NO29NO37NO38NO39NO48NO49NO58NO59NO68NO69NO79NO89NJ31NJ32NJ33NJ34NJ42NJ43NJ44NJ52NJ53NJ54NJ55NJ62NJ63NJ64NJ65NJ72NJ73NJ74NJ75NJ76NJ82NJ83NJ84NJ85NJ86NJ92NJ93NJ94NJ95NJ96NK02NK03NK04NK05NK06NK13NK14NK15NH90NJ00NJ01NJ10NJ11NJ12NJ13NJ14NJ21NJ22NJ23NJ24NJ25NJ32NJ33NJ34NJ35NJ36NJ42NJ43NJ44NJ45NJ46NJ54NJ55NJ56NJ64NJ65NJ66NJ74NJ75NJ76NJ86NN99NH72NH81NH82NH91NH92NH93NH94NH95NH96NJ00NJ01NJ02NJ03NJ04NJ05NJ06NJ11NJ12NJ13NJ14NJ15NJ16NJ17NJ23NJ24NJ25NJ26NJ27NJ34NJ35NJ36NJ45NH01NH02NH10NH11NH12NH13NH14NH20NH21NH22NH23NH24NH30NH31NH32NH33NH34NH40NH41NH42NH43NH44NH50NH51NH52NH53NH54NH60NH61NH62NH63NH64NH70NH71NH72NH73NH74NH75NH80NH81NH82NH83NH84NH85NH90NH91NH92NH93NH94NH95NH96NJ00NJ01NN39NN46NN47NN48NN49NN56NN57NN58NN59NN67NN68NN69NN77NN78NN79NN88NN89NN98NN99NG60NG70NG71NG72NG80NG81NG82NG90NG91NH00NH01NH10NH20NH30NM46NM47NM54NM55NM56NM57NM64NM65NM66NM67NM68NM69NM74NM75NM76NM77NM78NM79NM84NM85NM86NM87NM88NM89NM95NM96NM97NM98NM99NN05NN06NN07NN08NN09NN16NN17NN18NN19NN26NN27NN28NN29NN35NN36NN37NN38NN39NN46NN47NN48NN49NN57NN58NN59NM70NM71NM72NM73NM80NM81NM82NM83NM84NM90NM91NM92NM93NM94NM95NN00NN01NN02NN03NN04NN05NN10NN11NN12NN13NN14NN15NN16NN20NN21NN22NN23NN24NN25NN26NN30NN33NN34NN35NN36NN44NN45NN46NR79NR88NR89NR96NR97NR98NR99NS06NS07NS08NS09NS16NS17NS18NS19NS28NS29NN20NN21NN30NN31NS28NS29NS37NS38NS39NS46NS47NS48NS56NS57NR82NR83NR84NR92NR93NR94NR95NR96NR97NS01NS02NS03NS04NS05NS06NS07NS15NS16NR50NR51NR60NR61NR62NR63NR64NR65NR67NR68NR70NR71NR72NR73NR74NR75NR76NR77NR78NR79NR83NR84NR85NR86NR87NR88NR89NR95NR96NM40NM60NM61NM70NM71NR15NR16NR24NR25NR26NR27NR34NR35NR36NR37NR38NR39NR44NR45NR46NR47NR48NR49NR56NR57NR58NR59NR67NR68NR69NR79NL93NL94NM04NM05NM15NM16NM21NM22NM23NM24NM25NM26NM31NM32NM33NM34NM35NM41NM42NM43NM44NM45NM51NM52NM53NM54NM55NM61NM62NM63NM64NM72NM73NG13NG14NG15NG20NG23NG24NG25NG26NG30NG31NG32NG33NG34NG35NG36NG37NG38NG40NG41NG42NG43NG44NG45NG46NG47NG50NG51NG52NG53NG54NG55NG56NG60NG61NG62NG63NG64NG65NG66NG71NG72NG82NM19NM29NM37NM38NM39NM47NM48NM49NM59NB90NB91NC00NC01NC10NC11NC20NC21NG63NG64NG65NG72NG73NG74NG75NG76NG77NG78NG79NG82NG83NG84NG85NG86NG87NG88NG89NG91NG92NG93NG94NG95NG96NG97NG98NG99NH00NH01NH02NH03NH04NH05NH06NH07NH08NH09NH10NH11NH15NH16NH17NH18NH19NH27NH28NH29NC10NC20NC21NC30NC31NC40NH02NH03NH04NH05NH06NH07NH12NH13NH14NH15NH16NH17NH19NH23NH24NH25NH26NH27NH28NH29NH34NH35NH36NH37NH38NH39NH44NH45NH46NH47NH48NH49NH54NH55NH56NH57NH58NH59NH64NH65NH66NH67NH68NH69NH75NH76NH77NH78NH86NH87NH88NH97NH98NC22NC30NC31NC32NC33NC40NC41NC42NC43NC50NC51NC52NC60NC61NC62NC63NC70NC71NC72NC73NC74NC80NC81NC82NC83NC84NC90NC91NC92NC93ND01ND02NH49NH59NH68NH69NH78NH79NH88NH89NC01NC02NC03NC10NC11NC12NC13NC14NC15NC16NC20NC21NC22NC23NC24NC25NC26NC27NC31NC32NC33NC34NC35NC36NC37NC42NC43NC44NC45NC46NC52NC53NC54NC55NC56NC62NC63NC64NC65NC66NC73NC74NC75NC76NC83NC84NC85NC86NC93NC94NC95NC96NC92NC93NC94NC95NC96ND01ND02ND03ND04ND05ND06ND07ND12ND13ND14ND15ND16ND17ND23ND24ND25ND26ND27ND33ND34ND35ND36ND37ND47HW63HW83HX62NA00NA10NA64NA74NA81NA90NA91NA92NA93NB00NB01NB02NB03NB10NB11NB12NB13NB14NB20NB21NB22NB23NB24NB30NB31NB32NB33NB34NB35NB40NB41NB42NB43NB44NB45NB46NB52NB53NB54NB55NB56NF09NF19NF56NF58NF60NF61NF66NF67NF68NF70NF71NF72NF73NF74NF75NF76NF77NF80NF81NF82NF83NF84NF85NF86NF87NF88NF89NF95NF96NF97NF98NF99NG07NG08NG09NG18NG19NG29NG49NL57NL58NL68NL69NL79HY10HY20HY21HY22HY23HY30HY31HY32HY33HY34HY35HY40HY41HY42HY43HY44HY45HY50HY51HY52HY53HY54HY55HY60HY61HY62HY63HY64HY73HY74HY75ND19ND28ND29ND38ND39ND47ND48ND49ND59HP40HP50HP51HP60HP61HT93HT94HU14HU15HU16HU24HU25HU26HU27HU28HU30HU31HU32HU33HU34HU35HU36HU37HU38HU39HU40HU41HU42HU43HU44HU45HU46HU47HU48HU49HU53HU54HU55HU56HU57HU58HU59HU66HU67HU68HU69HZ16HZ17HZ26HZ27";to_gridref(S){const N=this.x/1e5|0,t=this.y/1e5|0;let e;e=t<5?N<5?"S":"T":t<10?N<5?"N":"O":N<5?"H":"J";let T=65+5*(4-t%5)+N%5;T>=73&&T++;const r=String.fromCharCode(T);return i(e+r,this.x-1e5*N,this.y-1e5*t,S||1)}to_hectad(){const S=this.x/1e5|0,N=this.y/1e5|0;let t;t=N<5?S<5?"S":"T":N<10?S<5?"N":"O":S<5?"H":"J";let e=65+5*(4-N%5)+S%5;return e>=73&&e++,t+String.fromCharCode(e)+((this.x-1e5*S)/1e4|0)+((this.y-1e5*N)/1e4|0)}is_gb_hectad(){return-1!==n.gbHectads.indexOf(this.to_hectad())}to_latLng(){const S=4e5,N=.85521133347722,e=6377563.396,T=.00667054007,s=this.x,a=this.y,h=.0016732203289875;let i,n=(a+1e5)/(.9996012717*e)+N;do{i=a+1e5-6353722.489*(1.0016767257674*(n-N)-.00502807228247412*Math.sin(n-N)*Math.cos(n+N)+(1.875*h*h+1.875*h*h*h)*Math.sin(2*(n-N))*Math.cos(2*(n+N))-35/24*h*h*h*Math.sin(3*(n-N))*Math.cos(3*(n+N))),n+=i/6375020.48098897}while(i>=.001);const o=Math.sin(n)*Math.sin(n),M=Math.tan(n)*Math.tan(n),d=1/Math.cos(n),H=.9996012717*e*Math.pow(1-T*o,-.5),O=6332495.651423464*Math.pow(1-T*o,-1.5),l=H/O-1,g=Math.tan(n)/(2*O*H),c=Math.tan(n)/(24*O*Math.pow(H,3))*(5+3*M+l-9*M*l),J=Math.tan(n)/(720*O*Math.pow(H,5))*(61+90*M+45*M*M),U=d/H,L=d/(6*H*H*H)*(H/O+2*M),C=d/(120*Math.pow(H,5))*(5+28*M+24*M*M),Y=d/(5040*Math.pow(H,7))*(61+662*M+1320*M*M+720*M*M*M),u=n-g*Math.pow(s-S,2)+c*Math.pow(s-S,4)-J*Math.pow(s-S,6),f=U*(s-S)-.034906585039887-L*Math.pow(s-S,3)+C*Math.pow(s-S,5)-Y*Math.pow(s-S,7);return new r(t*u,t*f).to_WGS84()}}class o extends h{country="IE";gridCoords=null;constructor(S,N){super(),this.x=S,this.y=N}static irishGrid={0:["V","Q","L","F","A"],1:["W","R","M","G","B"],2:["X","S","N","H","C"],3:["Y","T","O","J","D"]};to_latLng(){const S=1.000035,N=6377340.189,e=.0066705402933363,T=.0016732203841521,r=this.x-2e5,a=.0067153352074207,h=(5929615.3530033+(this.y-25e4)/S)/6366691.7742864415,i=h+.002509826623715886*Math.sin(2*h)+36745487490091978e-22*Math.sin(4*h)+151*T*T*T/96*Math.sin(6*h),n=N/Math.sqrt(1-e*Math.sin(i)*Math.sin(i)),o=Math.tan(i)*Math.tan(i),M=a*Math.cos(i)*Math.cos(i),d=N*(1-e)/Math.pow(1-e*Math.sin(i)*Math.sin(i),1.5),H=r/(n*S);let O=i-n*Math.tan(i)/d*(H*H/2-(5+3*o+10*M-4*M*M-9*a)*H*H*H*H/24+(61+90*o+298*M+45*o*o-1.6922644722700164-3*M*M)*H*H*H*H*H*H/720);O*=t;let l=(H-(1+2*o+M)*H*H*H/6+(5-2*M+28*o-3*M*M+8*a+24*o*o)*H*H*H*H*H/120)/Math.cos(i);return l=l*t-8,new s(O,l).to_WGS84()}to_gridref(S){const N=Math.floor(this.x/1e5),t=Math.floor(this.y/1e5);return o.irishGrid[N]&&o.irishGrid[N][t]?i(o.irishGrid[N][t],this.x-1e5*N,this.y-1e5*t,S||1):null}to_hectad(){const S=Math.floor(this.x/1e5),N=Math.floor(this.y/1e5);return o.irishGrid[S]&&o.irishGrid[S][N]?o.irishGrid[S][N]+Math.floor(this.x%1e5/1e4)+Math.floor(this.y%1e5/1e4):""}}class M extends h{country="CI";constructor(S,N){super(),this.x=S,this.y=N}to_latLng(){const S=.9996,N=.0067226700223333,e=6378388*S,r=6356911.946*S,s=this.x-5e5,a=H(this.y,0,e,0,.0016863406508729017,r),h=e/Math.sqrt(1-N*(Math.sin(a)*Math.sin(a))),i=h*(1-N)/(1-N*Math.sin(a)*Math.sin(a)),n=h/i-1,o=Math.tan(a)*Math.tan(a),M=Math.pow(Math.tan(a),4),O=Math.pow(Math.tan(a),6),l=Math.pow(Math.cos(a),-1),g=Math.tan(a)/(2*i*h),c=Math.tan(a)/(24*i*(h*h*h))*(5+3*o+n-9*n*o),J=Math.tan(a)/(720*i*Math.pow(h,5))*(61+90*o+45*M),U=a-s*s*g+Math.pow(s,4)*c-Math.pow(s,6)*J,L=Math.pow(Math.cos(a),-1)/h,C=l/(h*h*h*6)*(h/i+2*o),Y=l/(120*Math.pow(h,5))*(5+28*o+24*M),u=l/(5040*Math.pow(h,7))*(61+662*o+1320*M+720*O),f=s*L-.0523598775598-s*s*s*C+Math.pow(s,5)*Y-Math.pow(s,7)*u,P=d(U,f);return new T(P.lat*t,P.lng*t)}to_gridref(S){return this.y>=55e5?i("WA",this.x-5e5,this.y-55e5,S||1):this.y<55e5?i("WV",this.x-5e5,this.y-54e5,S||1):null}to_hectad(){return this.y>55e5?"WA"+this.x.toString().substring(1,2)+this.y.toString().substring(2,3):this.y<55e5?"WV"+this.x.toString().substring(1,2)+this.y.toString().substring(2,3):null}}const d=function(S,N){return e._transform(S,N,6378388,.0067226700223333,10,6378137,.00669438037928458,-83.901,-98.127,-118.635,0,0,0,0)},H=function(S,N,t,T,r,s){let a=(S-N)/t+T,h=e._Marc(s,r,T,a),i=(S-N-h)/t+a,n=0;for(;Math.abs(S-N-h)>1e-5&&n<20;)n+=1,i=(S-N-h)/t+a,h=e._Marc(s,r,T,i),a=i;return i};class O extends S{country="CI";GridCoords=M;gridCoords=null;constructor(){super(),this.parse_well_formed=this.from_string}from_string(N){let t,e=N.replace(/[\[\]\s\t.\/-]+/g,"").toUpperCase(),T="";/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(e)&&(S.quadrantOffsets.hasOwnProperty(e.substring(e.length-2))?(this.quadrantCode=e.substring(e.length-2),e=e.substring(0,e.length-2)):(T=e.charAt(e.length-1),e=e.substring(0,e.length-1))),/^(W[AV](?:\d\d){1,5})$/.test(e)?(t=O.gridref_string_to_e_n_l(e))?(this.length=t.length,this.gridCoords=new M(t.e,t.n),this.hectad=this.gridCoords.to_gridref(1e4),1e4===this.length&&(T||this.quadrantCode)?T?(this.preciseGridRef=e+T,this.tetrad=this.hectad+T,this.tetradLetter=T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):(this.preciseGridRef=e+this.quadrantCode,this.tetradLetter="",this.tetrad="",this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=e,this.length<=1e3&&this.set_tetrad())):(this.error=!0,this.errorMessage="Grid reference format not understood (odd length)."):(this.error=!0,this.errorMessage="Channel Island grid reference format not understood. ('"+N+"')")}static gridref_string_to_e_n_l(S){let N,t,e,T,r=S.substring(0,2);if("WA"===r)N=55e5;else{if("WV"!==r)return console.log("Bad Channel Island grid letters: '"+r+"'"),!1;N=54e5}let s=S.substring(2);switch(s.length){case 2:t=1e4*s.charAt(0),e=1e4*s.charAt(1),T=1e4;break;case 4:t=1e3*s.substring(0,2),e=1e3*s.substring(2),T=1e3;break;case 6:t=100*s.substring(0,3),e=100*s.substring(3),T=100;break;case 8:t=10*s.substring(0,4),e=10*s.substring(4),T=10;break;case 10:t=parseInt(s.substring(0,5),10),e=parseInt(s.substring(5),10),T=1;break;default:return console.log("Bad length for Channel Island grid ref '"+S+"'"),!1}return{e:t+5e5,n:e+N,length:T}}}class l extends S{country="GB";GridCoords=n;gridCoords=null;constructor(){super()}parse_well_formed(N){N.length>=5&&/^[A-Z]/.test(N.charAt(4))&&(S.quadrantOffsets.hasOwnProperty(N.substring(N.length-2))?this.quadrantCode=N.substring(N.length-2):this.tetradLetter=N.charAt(4),N=N.substring(0,4)),this.parse_wellformed_gb_gr_string_no_tetrads(N),this.tetradLetter||this.quadrantCode?this.tetradLetter?(this.preciseGridRef=this.tetrad=this.hectad+this.tetradLetter,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[this.tetradLetter][0],this.gridCoords.y+=S.tetradOffsets[this.tetradLetter][1]):(this.preciseGridRef=this.quadrant=N+this.quadrantCode,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=N,this.length<=1e3&&this.set_tetrad())}from_string(N){let t,e=N.replace(/[\[\]\s\t.-]+/g,"").toUpperCase(),T="";if(/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(e)&&(S.quadrantOffsets.hasOwnProperty(e.substring(e.length-2))?(this.quadrantCode=e.substring(e.length-2),e=e.substring(0,e.length-2)):(T=e.charAt(e.length-1),e=e.substring(0,e.length-1))),e===parseInt(e,10).toString()?e=e.substring(0,2)+"/"+e.substring(2):e.length>3&&"/"===e.charAt(2)&&/^[A-Z]{2}$/.test(e.substring(0,2))&&(e=e.replace("/","")),"VC"===e.substring(0,2))this.error=!0,this.errorMessage="Misplaced vice-county code in grid-reference field. ('"+e+"')",this.gridCoords=null,this.length=0;else if(null!==(t=e.match(/^([HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ](?:\d\d){1,5})$/)))e=t[0],this.parse_wellformed_gb_gr_string_no_tetrads(e),this.length>0?1e4===this.length&&(T||this.quadrantCode)?T?(this.preciseGridRef=e+T,this.tetradLetter=T,this.tetrad=this.hectad+T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):(this.preciseGridRef=e+this.quadrantCode,this.tetradLetter="",this.tetrad="",this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=e,this.length<=1e3&&this.set_tetrad()):(this.error=!0,this.errorMessage="GB grid reference format not understood (strange length).");else if(/^([\d]{2})\/((?:\d\d){1,5})$/.test(e)){switch(this.parse_gr_string_without_tetrads(e),this.length){case 1e4:e=this.gridCoords.to_gridref(1e4),this.hectad=e,T?(e+=T,this.tetradLetter=T,this.tetrad=this.hectad+T,this.length=2e3,this.gridCoords.x+=S.tetradOffsets[T][0],this.gridCoords.y+=S.tetradOffsets[T][1]):this.quadrantCode&&(e+=this.quadrantCode,this.quadrant=e,this.length=5e3,this.gridCoords.x+=S.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=S.quadrantOffsets[this.quadrantCode][1]);break;case 1e3:case 100:case 10:case 1:e=this.gridCoords.to_gridref(this.length),this.hectad=this.gridCoords.to_gridref(1e4),this.set_tetrad();break;default:this.error=!0,this.errorMessage="Bad grid square dimension ("+this.length+" m).",this.gridCoords=null,this.length=0}this.preciseGridRef=e}else this.gridCoords=null,this.length=0,this.error=!0,this.errorMessage="Grid reference format not understood. ('"+N+"')"}parse_gr_string_without_tetrads(N){let t,e,T,r;if(null!==(t=N.match(/^(\d{2})\/((?:\d\d){1,5})$/))){switch(t[1]){case"57":e=3e5,T=1e6;break;case"67":e=4e5,T=1e6;break;case"58":e=3e5,T=11e5;break;case"68":e=4e5,T=11e5;break;case"69":e=4e5,T=12e5;break;default:e=1e5*N.charAt(0),T=1e5*N.charAt(1)}r=t[2]}else{if(!S.letterMapping.hasOwnProperty(N.charAt(0))||!S.letterMapping.hasOwnProperty(N.charAt(1)))return this.length=0,void(this.gridCoords=null);let t=S.letterMapping[N.charAt(0)],s=S.letterMapping[N.charAt(1)];r=N.substring(2),e=t%5*5e5+s%5*1e5-1e6,T=5e5*-Math.floor(t/5)-1e5*Math.floor(s/5)+19e5}switch(r.length){case 2:this.gridCoords=new n(e+1e4*r.charAt(0),T+1e4*r.charAt(1)),this.length=1e4;break;case 4:this.gridCoords=new n(e+1e3*Math.floor(r/100),T+r%100*1e3),this.length=1e3;break;case 6:this.gridCoords=new n(e+100*Math.floor(r/1e3),T+r%1e3*100),this.length=100;break;case 8:this.gridCoords=new n(e+10*Math.floor(r/1e4),T+r%1e4*10),this.length=10;break;case 10:this.gridCoords=new n(e+Math.floor(r/1e5),T+r%1e5),this.length=1;break;default:console.log("Bad grid ref length, ref="+N),this.gridCoords=null,this.length=0}}parse_wellformed_gb_gr_string_no_tetrads(N){let t,e,T,r,s;switch(t=S.letterMapping[N.charAt(0)],e=S.letterMapping[N.charAt(1)],T=N.substring(2),r=t%5*5e5+e%5*1e5-1e6,s=5e5*-Math.floor(t/5)-1e5*Math.floor(e/5)+19e5,T.length){case 2:this.gridCoords=new n(r+1e4*T.charAt(0),s+1e4*T.charAt(1)),this.length=1e4,this.hectad=N;break;case 4:this.gridCoords=new n(r+1e3*Math.floor(T/100),s+T%100*1e3),this.length=1e3,this.hectad=N.substring(0,3)+N.charAt(4);break;case 6:this.gridCoords=new n(r+100*Math.floor(T/1e3),s+T%1e3*100),this.length=100,this.hectad=N.substring(0,3)+N.charAt(5);break;case 8:this.gridCoords=new n(r+10*Math.floor(T/1e4),s+T%1e4*10),this.length=10,this.hectad=N.substring(0,3)+N.charAt(6);break;case 10:this.gridCoords=new n(r+Math.floor(T/1e5),s+T%1e5),this.length=1,this.hectad=N.substring(0,3)+N.charAt(7);break;default:throw this.gridCoords=null,new Error("Bad grid ref length when parsing supposedly well-formed ref, ref='"+N+"'")}}}class g extends S{constructor(){super(),this.parse_well_formed=this.from_string}country="IE";GridCoords=o;gridCoords=null;static gridLetter={A:[0,4],B:[1,4],C:[2,4],D:[3,4],F:[0,3],G:[1,3],H:[2,3],J:[3,3],L:[0,2],M:[1,2],N:[2,2],O:[3,2],Q:[0,1],R:[1,1],S:[2,1],T:[3,1],V:[0,0],W:[1,0],X:[2,0],Y:[3,0]};from_string(S){let N=S.replace(/[\[\]\s\t.-]+/g,"").toUpperCase();/[ABCDEFGHIJKLMNPQRSTUVWXYZ]$/.test(N)&&(g.quadrantOffsets.hasOwnProperty(N.substring(N.length-2))?(this.quadrantCode=N.substring(N.length-2),N=N.substring(0,N.length-2)):(this.tetradLetter=N.substring(N.length-1),N=N.substring(0,N.length-1))),this.parse_gr_string_without_tetrads(N),this.length>0?this.tetradLetter||this.quadrantCode?this.tetradLetter?(this.preciseGridRef=this.hectad+this.tetradLetter,this.tetrad=this.preciseGridRef,this.length=2e3,this.gridCoords.x+=g.tetradOffsets[this.tetradLetter][0],this.gridCoords.y+=g.tetradOffsets[this.tetradLetter][1]):(this.preciseGridRef=this.hectad+this.quadrantCode,this.quadrant=this.preciseGridRef,this.length=5e3,this.gridCoords.x+=g.quadrantOffsets[this.quadrantCode][0],this.gridCoords.y+=g.quadrantOffsets[this.quadrantCode][1]):(this.preciseGridRef=N,this.length<=1e3&&this.set_tetrad()):(this.error=!0,this.errorMessage="Irish grid reference format not understood. ('"+S+"')")}static _IE_GRID_LETTERS="VQLFAWRMGBXSNHCYTOJD";parse_gr_string_without_tetrads(S){let N,t,e,T;if(/^\d{2}\/(?:\d\d){1,5}$/.test(S)){if(N=parseInt(S.charAt(0),10),t=parseInt(S.charAt(1),10),N>3||t>4)return console.log("bad grid square, ref='"+S+"' (Ireland)"),this.length=0,!1;e=S.substring(3),T=g._IE_GRID_LETTERS.charAt(5*N+t),N*=1e5,t*=1e5}else{if(S=S.replace("/",""),!/^[ABCDFGHJLMNOQRSTVWXY](?:\d\d){1,5}$/.test(S))return this.length=0,this.gridCoords=null,!1;if(!S)return console.log("Bad (empty) Irish grid ref"),this.length=0,this.gridCoords=null,!1;{T=S.charAt(0);let e=g._IE_GRID_LETTERS.indexOf(T);if(-1===e)return console.log("Bad grid ref grid-letter, ref='"+S+"' (Ireland)"),this.length=0,this.gridCoords=null,!1;N=1e5*Math.floor(e/5),t=e%5*1e5}e=S.substring(1)}switch(e.length){case 2:this.gridCoords=new o(N+1e4*e.charAt(0),t+1e4*e.charAt(1)),this.length=1e4,this.hectad=T+e;break;case 4:this.gridCoords=new o(N+1e3*Math.floor(e/100),t+e%100*1e3),this.length=1e3,this.hectad=T+e.charAt(0)+e.charAt(2);break;case 6:this.gridCoords=new o(N+100*Math.floor(e/1e3),t+e%1e3*100),this.length=100,this.hectad=T+e.charAt(0)+e.charAt(3);break;case 8:this.gridCoords=new o(N+10*Math.floor(e/1e4),t+e%1e4*10),this.length=10,this.hectad=T+e.charAt(0)+e.charAt(4);break;case 10:this.gridCoords=new o(N+Math.floor(e/1e5),t+e%1e5),this.length=1,this.hectad=T+e.charAt(0)+e.charAt(5);break;default:return console.log("Bad grid ref length, ref='"+S+"' (Ireland)"),this.length=0,this.gridCoords=null,!1}return!0}}S.from_string=function(S){let N,t=S.replace(/\s+/g,"").toUpperCase();if(!t)return!1;if(/^(?:[BCDFGHJLMNOQRSTVWXY]|[HJNOST][ABCDEFGHJKLMNOPQRSTUVWXYZ]|W[VA])\d{2}(?:[A-Z]|[NS][EW]|(?:\d{2}){0,4})?$/.test(t))return N=/^.\d/.test(t)?new g:"W"===t.charAt(0)?new O:new l,N.parse_well_formed(t),!(!N.length||N.error)&&N;if(N=new l,N.from_string(t),N.length&&!N.error)return N;if("W"===t.charAt(0)){if(N=new O,N.from_string(t),N.length&&!N.error)return N}else if(N=new g,N.from_string(t),N.length&&!N.error)return N;return!1};export{h as GridCoords,M as GridCoordsCI,n as GridCoordsGB,o as GridCoordsIE,S as GridRef,O as GridRefCI,l as GridRefGB,g as GridRefIE,a as LatLngCI,r as LatLngGB,s as LatLngIE,T as LatLngWGS84};
//# sourceMappingURL=gridrefutils.esm.js.map
