FROM ubuntu:22.04
RUN apt-get update
RUN echo "**** Installing Python and Java****" && \
    apt-get install -y build-essential python3-pip openjdk-17-jdk ant
WORKDIR /app
COPY webUI.py webUI.py
COPY api_file_map.py api_file_map.py
COPY visualization_ports.py visualization_ports.py
COPY code_management.py code_management.py
COPY file_utils.py file_utils.py
COPY rendering.py rendering.py
COPY simulation_control.py simulation_control.py
COPY poST2py.jar poST2py.jar
COPY translate.sh translate.sh
COPY translate_plant.sh translate_plant.sh
COPY startSim.sh startSim.sh
COPY templates/index.html templates/index.html
COPY static/ static/
COPY sim/ sim/
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
ENTRYPOINT ["python3"]
CMD ["webUI.py"]