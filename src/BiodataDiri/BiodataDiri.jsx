import Profile from "./Profile";
import Informasi from "./Informasi";
import Kontak from "./Kontak";
import Pendidikan from "./Pendidikan";
import SosialMedia from "./SosialMedia";
import Keterampilan from "./Keterampilan";

export default function BiodataDiri(){
    return(
        <div className="container">

            <h1 className="title">Biodata Diri</h1>

            <div className="grid">

                <div className="sidebar">
                    <Profile/>
                    <Kontak/>
                    <SosialMedia/>
                </div>

                <div className="content">
                    <Informasi/>
                    <Pendidikan/>
                    <Keterampilan/>
                </div>

            </div>

        </div>
    )
}