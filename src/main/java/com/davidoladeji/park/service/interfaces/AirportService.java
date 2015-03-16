package com.davidoladeji.park.service.interfaces;

import com.davidoladeji.park.model.Airport;

import javax.ejb.Local;
import java.util.List;

/**
 * Created by Daveola on 3/11/2015.
 */

@Local
public interface AirportService {

    public void createAirport(Airport airport);

    public List<Airport> findAllAirports();

    public void updateAirportById(Long id);

    public Airport findAirportById(Long id);

    public void deleteAirportById(Long id);

    public int countAllAirports();
}
